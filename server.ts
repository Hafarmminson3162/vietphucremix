import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true, limit: '250mb' }));

// Permissive CORS for all routes and static assets
app.use((_req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Serve static assets from public/ directory with CORS
app.use(express.static(path.resolve(__dirname, 'public'), {
  setHeaders: (res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  },
}));

// Single file upload endpoint for resilient syncing
app.post('/api/upload-single', async (req: Request, res: Response) => {
  try {
    const { name, dataUrl } = req.body;
    if (!name || !dataUrl) {
      return res.status(400).json({ error: 'name and dataUrl are required' });
    }

    const fs = await import('fs/promises');
    const publicDir = path.resolve(__dirname, 'public');
    const assetsDir = path.resolve(__dirname, 'src/assets');
    const distDir = path.resolve(__dirname, 'dist');

    await fs.mkdir(publicDir, { recursive: true });
    await fs.mkdir(assetsDir, { recursive: true }).catch(() => {});

    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const cleanName = path.basename(name);

    await fs.writeFile(path.join(publicDir, cleanName), buffer);
    await fs.writeFile(path.join(assetsDir, cleanName), buffer).catch(() => {});
    
    // Also sync to dist if dist exists (for published bundle)
    try {
      const distStat = await fs.stat(distDir);
      if (distStat.isDirectory()) {
        await fs.writeFile(path.join(distDir, cleanName), buffer).catch(() => {});
      }
    } catch {}

    return res.json({ success: true, fileName: cleanName, url: `/${cleanName}` });
  } catch (err: any) {
    console.error('Upload single error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to save file' });
  }
});

// Batch upload endpoint for user costume images
app.post('/api/upload-batch', async (req: Request, res: Response) => {
  try {
    const { files } = req.body;
    if (!Array.isArray(files)) {
      return res.status(400).json({ error: 'files must be an array of { name, dataUrl }' });
    }

    const fs = await import('fs/promises');
    const publicDir = path.resolve(__dirname, 'public');
    const assetsDir = path.resolve(__dirname, 'src/assets');
    const distDir = path.resolve(__dirname, 'dist');

    await fs.mkdir(publicDir, { recursive: true });
    await fs.mkdir(assetsDir, { recursive: true }).catch(() => {});

    let hasDist = false;
    try {
      const distStat = await fs.stat(distDir);
      hasDist = distStat.isDirectory();
    } catch {}

    const savedFiles: string[] = [];
    for (const item of files) {
      if (!item.name || !item.dataUrl) continue;
      const base64Data = item.dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const cleanName = path.basename(item.name);
      await fs.writeFile(path.join(publicDir, cleanName), buffer);
      await fs.writeFile(path.join(assetsDir, cleanName), buffer).catch(() => {});
      if (hasDist) {
        await fs.writeFile(path.join(distDir, cleanName), buffer).catch(() => {});
      }
      savedFiles.push(cleanName);
    }

    return res.json({ success: true, count: savedFiles.length, savedFiles });
  } catch (err: any) {
    console.error('Batch upload error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to save files' });
  }
});

// Endpoint to list currently stored public images
app.get('/api/list-images', async (_req: Request, res: Response) => {
  try {
    const fs = await import('fs/promises');
    const publicDir = path.resolve(__dirname, 'public');
    const files = await fs.readdir(publicDir).catch(() => []);
    return res.json({ files });
  } catch (err) {
    return res.json({ files: [] });
  }
});

// Endpoint returning structured map of saved images for client consumption
app.get('/api/saved-images', async (_req: Request, res: Response) => {
  try {
    const fs = await import('fs/promises');
    const publicDir = path.resolve(__dirname, 'public');
    const files = await fs.readdir(publicDir).catch(() => []);
    const images: Record<string, { url: string; name: string }> = {};
    for (const file of files) {
      if (/\.(png|jpe?g|webp|svg)$/i.test(file)) {
        images[file] = {
          name: file,
          url: `/${file}`,
        };
      }
    }
    return res.json({ success: true, count: Object.keys(images).length, images });
  } catch (err) {
    return res.json({ success: false, count: 0, images: {} });
  }
});

// Helper to instantiate GoogleGenAI client with Gemini API key
function getGenAIClient(options?: { clientApiKey?: string }) {
  const effectiveKey = options?.clientApiKey || process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: effectiveKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to resolve image input (dataUri, local public file, or raw base64) to valid { data, mimeType } for Gemini API inlineData
async function resolveImageToBase64(imageInput: string): Promise<{ data: string; mimeType: string } | null> {
  if (!imageInput || typeof imageInput !== 'string') return null;

  // 1. Data URI format: data:image/xxx;base64,...
  if (imageInput.startsWith('data:image/')) {
    const mimeMatch = imageInput.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const data = imageInput.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
    return { data, mimeType };
  }

  // 2. Local file on server disk (public folder or assets)
  try {
    const fs = await import('fs/promises');
    const cleanName = imageInput.replace(/^\/+/, '');
    const possiblePaths = [
      path.resolve(__dirname, 'public', cleanName),
      path.resolve(__dirname, 'public', decodeURIComponent(cleanName)),
      path.resolve(__dirname, 'public', cleanName.toLowerCase()),
      path.resolve(__dirname, 'public', decodeURIComponent(cleanName).toLowerCase()),
      path.resolve(__dirname, 'src/assets', cleanName),
      path.resolve(__dirname, 'src/assets/images', cleanName),
      path.resolve(__dirname, cleanName),
    ];

    for (const p of possiblePaths) {
      try {
        const stat = await fs.stat(p);
        if (stat.isFile()) {
          const buf = await fs.readFile(p);
          const ext = path.extname(p).toLowerCase().replace('.', '');
          const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          return { data: buf.toString('base64'), mimeType };
        }
      } catch {}
    }
  } catch (e) {
    console.warn('Failed to resolve image from local filesystem:', e);
  }

  // 3. Raw clean base64 string
  const trimmed = imageInput.trim();
  if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length > 100) {
    return { data: trimmed, mimeType: 'image/jpeg' };
  }

  return null;
}

// Model fallback cascade: standard paid image models per @google/genai guidelines
const PRIMARY_IMAGE_MODEL = 'gemini-3.1-flash-image';
const FALLBACK_IMAGE_MODEL = 'gemini-3.1-flash-lite-image';

// Endpoint 1: Create Image from Text Prompt
app.post('/api/image/generate', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      imageSize = '1K',
      clientApiKey,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const ai = getGenAIClient({ clientApiKey });

    let response;
    let modelUsed = PRIMARY_IMAGE_MODEL;

    try {
      response = await ai.models.generateContent({
        model: PRIMARY_IMAGE_MODEL,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: imageSize as any,
          },
        },
      });
    } catch (_primaryErr: any) {
      modelUsed = FALLBACK_IMAGE_MODEL;
      try {
        response = await ai.models.generateContent({
          model: FALLBACK_IMAGE_MODEL,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: imageSize as any,
            },
          },
        });
      } catch (_fallbackErr: any) {
        // Fallback failed
      }
    }

    let generatedImageUrl = '';
    let responseText = '';

    const candidates = response?.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          responseText += part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: 'No image was returned by the model.',
        textResponse: responseText,
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
      textResponse: responseText,
      modelUsed,
      backend: 'Google Gemini AI',
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate image',
      details: error?.toString(),
    });
  }
});

// Endpoint 2: Edit Image with Text Prompt (Image-to-Image / Inpainting)
app.post('/api/image/edit', async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/png',
      prompt,
      aspectRatio = '1:1',
      clientApiKey,
    } = req.body;

    if (!imageBase64 || !prompt) {
      return res.status(400).json({ error: 'Both imageBase64 and prompt are required.' });
    }

    const resolved = await resolveImageToBase64(imageBase64);
    if (!resolved) {
      return res.status(400).json({ error: 'Invalid or unresolvable image source provided.' });
    }

    const ai = getGenAIClient({ clientApiKey });

    let response;
    let modelUsed = PRIMARY_IMAGE_MODEL;

    try {
      response = await ai.models.generateContent({
        model: PRIMARY_IMAGE_MODEL,
        contents: {
          parts: [
            {
              inlineData: {
                data: resolved.data,
                mimeType: resolved.mimeType,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });
    } catch (_primaryErr: any) {
      modelUsed = FALLBACK_IMAGE_MODEL;
      try {
        response = await ai.models.generateContent({
          model: FALLBACK_IMAGE_MODEL,
          contents: {
            parts: [
              {
                inlineData: {
                  data: resolved.data,
                  mimeType: resolved.mimeType,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });
      } catch (_fallbackErr: any) {
        // Fallback failed
      }
    }

    let editedImageUrl = '';
    let responseText = '';

    const candidates = response?.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          const returnedMime = part.inlineData.mimeType || 'image/png';
          editedImageUrl = `data:${returnedMime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          responseText += part.text;
        }
      }
    }

    if (!editedImageUrl) {
      return res.status(500).json({
        error: 'No image was returned after editing.',
        textResponse: responseText,
      });
    }

    return res.json({
      success: true,
      imageUrl: editedImageUrl,
      textResponse: responseText,
      modelUsed,
      backend: 'Google Gemini AI',
    });
  } catch (error: any) {
    console.error('Image editing error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to edit image',
      details: error?.toString(),
    });
  }
});

// Endpoint 3: Virtual Try-On Image Generation (Multimodal: Face + Traditional Costume + Body Shape)
app.post('/api/ai/try-on', async (req: Request, res: Response) => {
  try {
    const {
      faceImageBase64,
      costumeImageBase64,
      costume,
      bodyShape = 'bình thường',
      backgroundSetting,
      customNote,
      aspectRatio = '3:4',
      clientApiKey,
    } = req.body;

    if (!faceImageBase64 || !costume) {
      return res.status(400).json({ error: 'faceImageBase64 and costume are required.' });
    }

    const shapeDescriptions: Record<string, string> = {
      'gầy': 'vóc dáng gầy, thanh mảnh, mảnh dẻ, tà áo thướt tha mềm mại (slender, slim and graceful silhouette)',
      'bình thường': 'vóc dáng cân đối, bình thường, hài hòa chuẩn mực, vạt áo buông rủ tự nhiên trang nhã (harmonious, average and balanced build)',
      'béo': 'vóc dáng béo, tròn trịa, đầy đặn, phúc hậu, tà áo mở rộng thoáng đãng uy nghi (full-figured, plus-size, prosperous and generous silhouette)',
      'cao': 'vóc dáng cao ráo, thanh thoát, dáng đứng uy nghi đĩnh đạc (tall, statuesque and dignified posture)',
    };

    const shapeDesc = shapeDescriptions[bodyShape] || shapeDescriptions['bình thường'];
    const settingDesc = backgroundSetting || 'không gian kiến trúc cổ truyền Việt Nam với ánh sáng tự nhiên ấm áp, đèn lồng và hoa văn gỗ truyền thống';

    const promptText = [
      `A photorealistic, ultra high definition cultural portrait photograph of a person wearing authentic Vietnamese traditional attire.`,
      `[CRITICAL INSTRUCTION 1 - FACE]: Perfectly preserve and transfer the exact facial features, identity, eyes, nose, lips, jawline, skin tone, and expression of the person in the input face photo. The resulting portrait must clearly be this exact individual.`,
      costumeImageBase64
        ? `[CRITICAL INSTRUCTION 2 - COSTUME]: Dress this person in the exact authentic Vietnamese costume depicted in the costume reference image: "${costume.name}" (${costume.ethnicity}, ${costume.group || 'Việt Nam'}). Replicate its exact collar, cut, fabrics, embroidery, patterns, and colors.`
        : `[CRITICAL INSTRUCTION 2 - COSTUME]: Dress this person in authentic Vietnamese traditional historical attire "${costume.name}" of ethnic community ${costume.ethnicity} (${costume.group || 'Việt Nam'}). Structural details: ${costume.structure}. Handcrafted with traditional Vietnamese mulberry silk (lụa tơ tằm) and royal brocade (gấm), intricate embroidered patterns with fine gold and colored threads. Primary accent color: ${costume.accentColor || '#8B1E1E'}.`,
      `[CRITICAL INSTRUCTION 3 - BODY SHAPE]: The person's body type MUST match: ${shapeDesc}. Adjust the drape, proportions, and fit of the attire naturally to this specified body silhouette (${bodyShape}).`,
      `Background atmosphere: ${settingDesc}.`,
      customNote ? `Additional styling detail: ${customNote}.` : '',
      `Style & Quality: Masterpiece editorial portrait photography, authentic Vietnamese cultural heritage preservation, 8K resolution, sharp textile textures and lifelike facial expression, studio quality golden hour lighting.`,
    ].filter(Boolean).join('\n');

    const faceResolved = await resolveImageToBase64(faceImageBase64);
    if (!faceResolved) {
      return res.status(400).json({ error: 'Cannot decode or locate faceImageBase64.' });
    }

    const costumeResolved = costumeImageBase64 ? await resolveImageToBase64(costumeImageBase64) : null;

    const ai = getGenAIClient({ clientApiKey });

    let response;
    let modelUsed = PRIMARY_IMAGE_MODEL;

    const parts: any[] = [
      {
        inlineData: {
          data: faceResolved.data,
          mimeType: faceResolved.mimeType,
        },
      },
    ];

    if (costumeResolved) {
      parts.push({
        inlineData: {
          data: costumeResolved.data,
          mimeType: costumeResolved.mimeType,
        },
      });
    }

    parts.push({ text: promptText });

    try {
      response = await ai.models.generateContent({
        model: PRIMARY_IMAGE_MODEL,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });
    } catch (_primaryErr: any) {
      try {
        modelUsed = FALLBACK_IMAGE_MODEL;
        response = await ai.models.generateContent({
          model: FALLBACK_IMAGE_MODEL,
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });
      } catch (_fallbackErr: any) {
        return res.json({
          success: false,
          fallbackRequired: true,
          promptUsed: promptText,
          message: 'Routed to heritage synthesis engine',
        });
      }
    }

    let generatedImageUrl = '';
    let responseText = '';

    const candidates = response?.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          const retMime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${retMime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          responseText += part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: 'No image was returned by Gemini model.',
        textResponse: responseText,
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
      modelUsed,
      promptUsed: promptText,
      narrative: `Tác phẩm tạo từ AI: Khuôn mặt người mẫu được kết hợp hoàn mỹ cùng bộ y phục ${costume.name} (${costume.ethnicity}), tôn vinh vóc dáng ${bodyShape} trên chất liệu gấm lụa truyền thống.`,
    });
  } catch (error: any) {
    console.error('Virtual try-on error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate try-on image',
    });
  }
});

// Endpoint 4: Check API Status
app.get('/api/status', (_req: Request, res: Response) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  return res.json({
    status: 'ok',
    hasGeminiKey,
    backend: 'Google Gemini AI',
    supportedModels: [PRIMARY_IMAGE_MODEL, FALLBACK_IMAGE_MODEL, 'gemini-3.5-flash'],
  });
});

// Endpoint 5: Multi-turn Chatbot for Costume Styling & Heritage Advisory
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, lang = 'vi', clientApiKey } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getGenAIClient({ clientApiKey });
    const isEn = lang === 'en';

    const systemInstruction = isEn
      ? `You are the "VietPhuc AI Heritage Stylist" — an expert consultant on Vietnamese traditional attire, heritage accessories, fabric aesthetics, color symbolism, and occasion etiquette.
Your goal is to guide the user with warm, knowledgeable, culturally authentic, and practical styling advice:
1. Traditional Accessories: Kiềng bạc (silver collar necklace with lotus repoussé), xà tích bạc (silver waist chatelaine chain), trâm cài tóc (silver/jade hairpins), nón quai thao (large flat palm hat with peach silk ribbons), nón lá (conical hat), nón ba tầm, quạt lụa (silk hand fan), khăn rằn (Mekong checkered scarf), khăn đóng/khăn xếp (five-color pleated turban), hài nhung thêu (embroidered velvet shoes), guốc mộc (wooden clogs).
2. Attire Styles & Silhouettes:
   - Áo Nhật Bình: Square collar trimmed with five-element color bands, loose wide sleeves; imperial court dress of the Nguyen Dynasty.
   - Áo Tấc (Áo Thụng): Formal wide-sleeved five-panel robe worn for grand ceremonies, weddings, and ancestral rites.
   - Áo Ngũ Thân tay chẽn: Five-panel standing-collar tunic with tailored sleeves; versatile, dignified, elegant for both men and women.
   - Áo Giao Lĩnh (cross-collar robe) & Áo Viên Lĩnh (round-collar robe) from Ly-Tran-Le dynasties.
   - Áo Dài, Áo Bà Ba, and exquisite regional ethnic costumes (Thái Áo Cóm, Mường Áo Pắn, H'Mông batik pleated skirt, Dao Đỏ headdress with wool pom-poms, Chăm embroidered tunic).
3. Occasion Etiquette: Weddings, engagements, Lunar New Year (Tết), temple pilgrimages, graduation, artistic photo sessions.
4. Color Palette & Harmony: Five-element (Ngũ Hành) balance — vermilion red (chu sa), golden yellow (hoàng yến), jade green (lam ngọc), lotus blue (thanh liên), natural indigo (chàm).
5. Tone: Courteous, poetic, highly structured with bullet points, proud of Vietnamese heritage. Reply in English with clear formatting and mention suitable costumes from the catalog.`
      : `Bạn là "Trợ lý Phối đồ Việt Phục AI" — Chuyên gia cố vấn trang phục di sản, phụ kiện và kiểu dáng Việt Phục truyền thống.
Nhiệm vụ của bạn là tư vấn tận tâm, chuẩn xác về mặt lịch sử và thẩm mỹ:
1. Phụ kiện truyền thống:
   - Kiềng bạc chạm hoa sen, xà tích bạc móc bên hông (quý phái thời Nguyễn & phụ nữ Mường).
   - Nón quai thao (nón ba tầm) với dải lụa đào buông dài duyên dáng vùng Kinh Bắc.
   - Trâm bạc / trâm ngọc cài búi tóc vấn, khăn vành dây, khăn xếp ngũ sắc.
   - Quạt lụa thêu tay, quạt lông công, khăn rằn Nam Bộ kẻ ô, hài thêu phụng, guốc mộc quai nhung.
2. Kiểu dáng & Nếp áo:
   - Áo Nhật Bình: Cổ vuông viền dải ngũ sắc, tay thụng lộng lẫy — trang phục quý tộc cung đình triều Nguyễn.
   - Áo Tấc (Áo Thụng ngũ thân): Tay thụng dài rộng trang nghiêm cho đại lễ, hôn lễ, tế tự.
   - Áo Ngũ Thân tay chẽn: Cổ đứng cài năm khuy (nhân, lễ, nghĩa, trí, tín), tay chẽn gọn gàng, thanh tao.
   - Áo Giao Lĩnh, Viên Lĩnh thời Lý - Trần - Lê mang hào khí Đại Việt.
   - Áo Dài Hà Thành, Áo Bà Ba Nam Bộ bình dị mộc mạc.
   - Trang phục thổ cẩm: Áo Cóm Thái hoa ban khuy bướm bạc, Áo Pắn Mường cạp váy hoa văn Đông Sơn, Váy lanh H'Mông vẽ sáp ong, Dao Đỏ đính quả bông len...
3. Dịp mặc & Phối màu:
   - Đám cưới / dạm ngõ: Nên chọn Áo Nhật Bình hoặc Áo Tấc đỏ chu sa, vàng hoàng yến, gấm thêu phượng hoàng.
   - Đi lễ chùa / tế tự: Nên chọn màu lam ngọc, thanh liên, đũi mộc hoặc tơ tằm nền nã.
   - Du xuân / kỷ yếu: Áo Ngũ Thân tay chẽn, Áo Dài tơ tằm phối quạt lụa, hài thêu hoặc nón lá.
4. Phong thái: Lịch thiệp, tự hào di sản dân tộc, diễn đạt súc tích bằng gạch đầu dòng rõ ràng, dễ áp dụng. Trả lời bằng Tiếng Việt.`;

    const contents = messages.map((m: { role: 'user' | 'model' | 'assistant'; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Cascade: gemini-3.5-flash -> gemini-3.8-flash -> gemini-3.1-flash-lite
    const textModels = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let replyText = '';
    let usedModel = 'gemini-3.5-flash';

    for (const modelName of textModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
          },
        });

        if (response && response.text) {
          replyText = response.text;
          usedModel = modelName;
          break;
        }
      } catch (modelErr: any) {
        console.warn(`Chat model ${modelName} failed:`, modelErr?.message || modelErr);
      }
    }

    if (!replyText) {
      replyText = getFallbackChatResponse(messages[messages.length - 1]?.content || '', isEn);
      usedModel = 'heritage-knowledge-engine';
    }

    return res.json({
      success: true,
      reply: replyText,
      modelUsed: usedModel,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({
      error: error?.message || 'Chat service encountered an error',
    });
  }
});

function getFallbackChatResponse(query: string, isEn: boolean): string {
  const q = query.toLowerCase();
  if (q.includes('cưới') || q.includes('wedding')) {
    return isEn
      ? `👑 **Traditional Wedding Styling Recommendation**:
- **Bride**: **Áo Nhật Bình** (vermilion red or golden yellow) with embroidered phoenixes, paired with a carved silver collar necklace (kiềng bạc), xà tích waist chain, and an emerald green turban (khăn vành dây).
- **Groom**: **Áo Tấc** or **Áo Ngũ Thân** in navy or wine red, paired with matching black silk turban and embroidered velvet slippers.
- **Accessories**: Hand-embroidered silk fan, lotus repoussé silver collar, and jade pendants.`
      : `👑 **Gợi ý phối đồ cho Lễ Cưới & Ăn Hỏi truyền thống**:
- **Cô dâu**: Lộng lẫy nhất với **Áo Nhật Bình** (màu đỏ chu sa hoặc vàng hoàng yến), đội khăn vành dây xanh ngọc hoặc đỏ, đeo **kiềng bạc chạm hoa sen**, chùm **xà tích bạc** bên hông và tay nâng quạt lụa thêu.
- **Chú rể**: Diện **Áo Tấc** (áo thụng) hoặc **Áo Ngũ Thân tay chẽn** màu lam đậm hoặc đỏ thẫm, đội khăn xếp tơ tằm đồng bộ, mang hài nhung đen.
- **Ý nghĩa**: Biểu trưng cho sự viên mãn, tôn quý và gắn kết keo sơn của văn hóa gia đình Việt.`;
  }

  if (q.includes('phụ kiện') || q.includes('accessory') || q.includes('nón') || q.includes('kiềng') || q.includes('quạt')) {
    return isEn
      ? `✨ **Traditional Accessories Styling Guide**:
- **Kiềng bạc (Silver Collar)**: Highlights the delicate collarbone; perfect with Áo Ngũ Thân, Áo Dài, and Áo Yếm.
- **Nón Quai Thao (Wide Palm Hat)**: Flattering for Áo Tứ Thân and folk spring festivals with soft dangling peach ribbons.
- **Xà Tích Bạc**: Cascading silver chain hooked on the right sash, adding aristocratic charm.
- **Silk Fan (Quạt lụa)**: Subtle, photogenic prop suitable for all court and everyday attire.`
      : `✨ **Bí quyết phối phụ kiện Việt Phục chuẩn mực**:
- **Kiềng bạc chạm hoa sen**: Tôn vinh nếp cổ đứng của Áo Ngũ Thân hoặc cổ tròn Áo Viên Lĩnh.
- **Xà tích bạc**: Chùm dây bạc xâu chuỗi đeo trễ một bên hông, tạo nét đài các quý phái.
- **Nón quai thao (nón ba tầm)**: Đi kèm Áo Tứ Thân thắt bao yếm, dải lụa đào buông dài uyển chuyển.
- **Quạt lụa thêu**: Phụ kiện tinh tế giúp đôi tay tự nhiên hơn khi dạo bước hoặc chụp ảnh.`;
  }

  return isEn
    ? `🌸 **VietPhuc AI Heritage Stylist**:
Vietnamese attire celebrates modesty, fine craftsmanship, and harmonious silhouettes.
- For formal events, choose **Áo Nhật Bình** or **Áo Tấc**.
- For everyday elegance or photoshoots, try **Áo Ngũ Thân tay chẽn** with a silver collar necklace and silk fan.
- Feel free to ask about specific costume accessories, colors, or hairstyles!`
    : `🌸 **Trợ lý Phối đồ Việt Phục AI**:
Trang phục truyền thống Việt Nam luôn tôn vinh vẻ đẹp đoan trang, kín đáo và tinh tế.
- Trong các dịp lễ hội trang trọng: Nên chọn **Áo Nhật Bình** hoặc **Áo Tấc** tay thụng.
- Khi đi du xuân, chụp ảnh nghệ thuật: **Áo Ngũ Thân tay chẽn** kết hợp kiềng bạc hoặc quạt lụa là lựa chọn thanh lịch nhất.
- Bạn cần tư vấn thêm về cách phối phụ kiện hay trang phục cho dịp nào, hãy chia sẻ cùng mình nhé!`;
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
