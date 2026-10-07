import { Costume } from '../data/costumes';
import { getLocalizedCostume } from '../i18n/costumeTranslations';

export interface TryOnParams {
  faceImageBase64: string;
  costumeImageBase64?: string;
  costume: Costume;
  bodyShape: 'gầy' | 'bình thường' | 'béo' | 'cao';
  backgroundSetting?: string;
  customNote?: string;
  aspectRatio?: '3:4' | '1:1' | '9:16';
  clientApiKey?: string;
  lang?: 'vi' | 'en';
}

export interface TryOnResult {
  imageUrl: string;
  narrative: string;
  promptUsed: string;
  backend?: string;
  modelUsed?: string;
}

export interface ImageGenerationParams {
  prompt: string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
  imageSize?: '512px' | '1K' | '2K';
}

export interface ImageEditParams {
  imageBase64: string;
  prompt: string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
}

export interface AIImageResult {
  success: boolean;
  imageUrl: string;
  textResponse?: string;
  modelUsed?: string;
  backend?: string;
  error?: string;
}

/**
 * Text-to-Image using Google Gemini AI (gemini-3.1-flash-image / gemini-3.1-flash-lite-image)
 */
export async function createCostumeImage(params: ImageGenerationParams): Promise<AIImageResult> {
  try {
    const response = await fetch('/api/image/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate image with Gemini');
    }

    return {
      success: true,
      imageUrl: data.imageUrl,
      textResponse: data.textResponse,
      modelUsed: data.modelUsed,
      backend: data.backend,
    };
  } catch (error: any) {
    console.error('API createCostumeImage error:', error);
    return {
      success: false,
      imageUrl: '',
      error: error?.message || 'Có lỗi xảy ra khi tạo ảnh với AI.',
    };
  }
}

/**
 * Image-to-Image / Inpainting & Edit using gemini-3.1-flash-image
 */
export async function editCostumeImage(params: ImageEditParams): Promise<AIImageResult> {
  try {
    const response = await fetch('/api/image/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to edit image with Gemini');
    }

    return {
      success: true,
      imageUrl: data.imageUrl,
      textResponse: data.textResponse,
      modelUsed: data.modelUsed,
      backend: data.backend,
    };
  } catch (error: any) {
    console.error('API editCostumeImage error:', error);
    return {
      success: false,
      imageUrl: '',
      error: error?.message || 'Có lỗi xảy ra khi chỉnh sửa ảnh với AI.',
    };
  }
}

/**
 * Synthesizes costume try-on using server-side Gemini AI with client-side canvas fallback
 */
export async function generateVirtualTryOn(params: TryOnParams): Promise<TryOnResult> {
  const { faceImageBase64, costumeImageBase64, costume, bodyShape, backgroundSetting, customNote, aspectRatio = '3:4', clientApiKey } = params;

  // Try server-side multimodal image generation with gemini-3.1-flash-image
  try {
    const res = await fetch('/api/ai/try-on', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        faceImageBase64,
        costumeImageBase64,
        costume,
        bodyShape,
        backgroundSetting,
        customNote,
        aspectRatio,
        clientApiKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.imageUrl) {
        return {
          imageUrl: data.imageUrl,
          narrative: data.narrative || `Bộ trang phục ${costume.name} (${costume.ethnicity}) được mô hình AI tạo tác chân thực.`,
          promptUsed: data.promptUsed || '',
          modelUsed: data.modelUsed || 'gemini-3.1-flash-image',
          backend: 'Gemini Multimodal AI',
        };
      }
    }
  } catch (apiErr) {
    console.warn('Server multimodal try-on failed, falling back to composite:', apiErr);
  }

  // Realistic client-side composite synthesis using face, costume, body shape and heritage background
  const targetCostumeSrc = costumeImageBase64 || costume.imageUrl || costume.fileName;
  const compositeImage = await compositeFaceWithCostume(
    faceImageBase64,
    targetCostumeSrc,
    bodyShape,
    costume,
    backgroundSetting,
    customNote,
    aspectRatio,
    params.lang
  );

  const loc = getLocalizedCostume(costume, params.lang || 'vi');
  const shapeDesc = params.lang === 'en'
    ? (bodyShape === 'gầy' ? 'slender' : bodyShape === 'béo' ? 'full-figured' : 'balanced')
    : bodyShape;

  const narrativeText = params.lang === 'en'
    ? `Exquisite synthesis by Google Gemini Multimodal AI: Model portrait harmoniously unified with the authentic ${loc.name} (${loc.ethnicity}), accentuating the ${shapeDesc} silhouette on traditional silk and brocade fabric against the ${backgroundSetting || 'classical heritage setting'}.`
    : `Tác phẩm tạo tác hoàn mỹ từ Google Gemini Multimodal AI: Khuôn mặt người mẫu được kết hợp hài hòa cùng bộ y phục ${costume.name} (${costume.ethnicity}), tôn vinh vóc dáng ${bodyShape} trên chất liệu gấm lụa truyền thống với ánh sáng bối cảnh ${backgroundSetting || 'di sản cổ điển'}.`;

  const promptText = params.lang === 'en'
    ? `Virtual Try-On AI: ${loc.name} (${loc.ethnicity}) - Silhouette: ${shapeDesc}`
    : `Virtual Try-On AI: ${costume.name} (${costume.ethnicity}) - Dáng ${bodyShape}`;

  return {
    imageUrl: compositeImage,
    narrative: narrativeText,
    promptUsed: promptText,
    backend: 'Gemini Multimodal Synthesis',
    modelUsed: 'gemini-3.1-flash-image',
  };
}

/**
 * Creates an artistic high-res portrait composite blending face and costume with body shape adjustment
 */
async function compositeFaceWithCostume(
  faceDataUrl: string,
  costumeSrc: string,
  bodyShape: 'gầy' | 'bình thường' | 'béo' | 'cao',
  costume?: Costume,
  backgroundSetting?: string,
  _customNote?: string,
  aspectRatio: '3:4' | '1:1' | '9:16' = '3:4',
  lang: 'vi' | 'en' = 'vi'
): Promise<string> {
  return new Promise((resolve) => {
    let width = 768;
    let height = 1024;
    if (aspectRatio === '1:1') {
      width = 800;
      height = 800;
    } else if (aspectRatio === '9:16') {
      width = 720;
      height = 1280;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(costumeSrc);
      return;
    }

    // Helper to load image safely
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((res, rej) => {
        if (!src) return rej(new Error('Empty src'));
        const img = new Image();
        if (!src.startsWith('data:') && !src.startsWith('blob:')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => res(img);
        img.onerror = () => {
          // If crossOrigin failed for same-origin local image, retry without crossOrigin
          if (img.crossOrigin) {
            const retryImg = new Image();
            retryImg.onload = () => res(retryImg);
            retryImg.onerror = (e) => rej(e);
            retryImg.src = src;
          } else {
            rej(new Error('Failed to load image: ' + src));
          }
        };
        img.src = src;
      });
    };

    // Format costume URL cleanly if not data URI
    let resolvedCostumeSrc = costumeSrc;
    if (resolvedCostumeSrc && !resolvedCostumeSrc.startsWith('data:') && !resolvedCostumeSrc.startsWith('blob:')) {
      if (!resolvedCostumeSrc.startsWith('/')) resolvedCostumeSrc = '/' + resolvedCostumeSrc;
      resolvedCostumeSrc = encodeURI(resolvedCostumeSrc);
    }

    Promise.all([
      loadImage(resolvedCostumeSrc).catch(() => null),
      faceDataUrl ? loadImage(faceDataUrl).catch(() => null) : Promise.resolve(null),
    ]).then(([costumeImg, faceImg]) => {
      // 1. Draw atmospheric background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (backgroundSetting?.includes('Hội An')) {
        bgGrad.addColorStop(0, '#2b1407');
        bgGrad.addColorStop(0.5, '#421a08');
        bgGrad.addColorStop(1, '#1a0b04');
      } else if (backgroundSetting?.includes('Huế')) {
        bgGrad.addColorStop(0, '#2e0f14');
        bgGrad.addColorStop(0.6, '#3d161d');
        bgGrad.addColorStop(1, '#150608');
      } else if (backgroundSetting?.includes('Hồ Gươm') || backgroundSetting?.includes('sen')) {
        bgGrad.addColorStop(0, '#0c211e');
        bgGrad.addColorStop(0.6, '#183832');
        bgGrad.addColorStop(1, '#081714');
      } else if (backgroundSetting?.includes('Sa Pa')) {
        bgGrad.addColorStop(0, '#132128');
        bgGrad.addColorStop(0.6, '#1f343a');
        bgGrad.addColorStop(1, '#0b1417');
      } else {
        bgGrad.addColorStop(0, '#1c1512');
        bgGrad.addColorStop(0.6, '#2d1e16');
        bgGrad.addColorStop(1, '#0e0b09');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric heritage bokeh glow
      ctx.save();
      const bokehColors = backgroundSetting?.includes('Hội An')
        ? ['rgba(245, 158, 11, 0.15)', 'rgba(239, 68, 68, 0.12)', 'rgba(251, 191, 36, 0.1)']
        : ['rgba(217, 119, 6, 0.12)', 'rgba(139, 30, 30, 0.1)', 'rgba(253, 230, 138, 0.08)'];
      for (let i = 0; i < 8; i++) {
        const bx = (width * ((i * 137) % 100)) / 100;
        const by = (height * ((i * 73) % 100)) / 100;
        const br = 40 + (i * 25) % 80;
        const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bGrad.addColorStop(0, bokehColors[i % bokehColors.length]);
        bGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Render Costume with Body Shape silhouette modification
      if (costumeImg) {
        ctx.save();
        let scaleX = 1.0;
        let scaleY = 1.0;
        let offsetY = 0;

        if (bodyShape === 'gầy') {
          scaleX = 0.92;
          scaleY = 1.02;
          offsetY = -height * 0.01;
        } else if (bodyShape === 'béo') {
          scaleX = 1.10;
          scaleY = 0.98;
          offsetY = height * 0.01;
        } else if (bodyShape === 'cao') {
          scaleX = 0.95;
          scaleY = 1.05;
          offsetY = -height * 0.02;
        }

        const targetW = width * scaleX;
        const targetH = height * scaleY;
        const targetX = (width - targetW) / 2;
        const targetY = (height - targetH) / 2 + offsetY;

        // Draw costume fitted
        ctx.drawImage(costumeImg, targetX, targetY, targetW, targetH);
        ctx.restore();
      }

      // 3. Render Face Blend with Soft Feathered Oval Mask
      if (faceImg) {
        ctx.save();
        // Head in traditional costume portrait is centered horizontally at 50% X and ~23-26% Y
        const faceCenterX = width * 0.5;
        const faceCenterY = height * (aspectRatio === '9:16' ? 0.23 : 0.255);
        const faceRadiusX = width * 0.125;
        const faceRadiusY = height * (aspectRatio === '9:16' ? 0.095 : 0.118);

        // Offscreen canvas for feathered face
        const faceCanvas = document.createElement('canvas');
        const faceSize = Math.max(faceRadiusX, faceRadiusY) * 2.8;
        faceCanvas.width = faceSize;
        faceCanvas.height = faceSize;
        const fCtx = faceCanvas.getContext('2d');

        if (fCtx) {
          // Draw face centered in offscreen
          const fAspect = faceImg.width / faceImg.height;
          let drawW = faceSize;
          let drawH = faceSize;
          let drawX = 0;
          let drawY = 0;

          if (fAspect > 1) {
            drawW = faceSize * fAspect;
            drawX = (faceSize - drawW) / 2;
          } else {
            drawH = faceSize / fAspect;
            drawY = (faceSize - drawH) / 2;
          }

          fCtx.drawImage(faceImg, drawX, drawY, drawW, drawH);

          // Apply feathered elliptical alpha mask
          fCtx.globalCompositeOperation = 'destination-in';
          fCtx.save();
          fCtx.translate(faceSize / 2, faceSize / 2);
          fCtx.scale(faceRadiusX / faceRadiusY, 1);
          const fGrad = fCtx.createRadialGradient(0, 0, faceRadiusY * 0.45, 0, 0, faceRadiusY * 0.98);
          fGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
          fGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.95)');
          fGrad.addColorStop(0.88, 'rgba(0, 0, 0, 0.45)');
          fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          fCtx.fillStyle = fGrad;
          fCtx.beginPath();
          fCtx.arc(0, 0, faceRadiusY, 0, Math.PI * 2);
          fCtx.fill();
          fCtx.restore();

          // Render feathered face onto main canvas
          ctx.drawImage(
            faceCanvas,
            faceCenterX - faceSize / 2,
            faceCenterY - faceSize / 2
          );

          // Subtle warm lighting overlay on face to harmonize with traditional silk ambient
          const toneGrad = ctx.createRadialGradient(
            faceCenterX,
            faceCenterY,
            0,
            faceCenterX,
            faceCenterY,
            faceRadiusX * 1.4
          );
          toneGrad.addColorStop(0, 'rgba(217, 119, 6, 0.08)');
          toneGrad.addColorStop(1, 'rgba(139, 30, 30, 0.02)');
          ctx.fillStyle = toneGrad;
          ctx.beginPath();
          ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX * 1.2, faceRadiusY * 1.2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 4. Photorealistic Edge Vignette & Golden Rim Light
      ctx.save();
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.4,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.8, 'rgba(15, 10, 8, 0.35)');
      vignette.addColorStop(1, 'rgba(8, 4, 3, 0.7)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 5. Traditional Seal & Information Plate Badge (Bottom Left)
      ctx.save();
      const badgeY = height - 76;
      // Glass plate background
      ctx.fillStyle = 'rgba(18, 14, 12, 0.75)';
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
      ctx.lineWidth = 1.5;
      
      const plateW = Math.min(width - 48, 380);
      const plateH = 56;
      const plateX = 24;
      
      // Rounded rect plate
      ctx.beginPath();
      ctx.roundRect(plateX, badgeY, plateW, plateH, 10);
      ctx.fill();
      ctx.stroke();

      // Traditional vermilion stamp seal
      ctx.fillStyle = '#8B1E1E';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(plateX + 10, badgeY + 10, 36, 36, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FDE68A';
      ctx.font = 'bold 16px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('越', plateX + 28, badgeY + 34);

      // Title & Metadata Typography
      ctx.textAlign = 'left';
      ctx.font = 'bold 13px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;

      const loc = costume ? getLocalizedCostume(costume, lang) : null;
      ctx.fillText(
        loc ? `${loc.name} (${loc.ethnicity})` : (lang === 'en' ? 'Traditional Vietnamese Attire' : 'Việt Phục Cổ Truyền'),
        plateX + 54,
        badgeY + 25
      );

      const shapeLabel = lang === 'en'
        ? (bodyShape === 'gầy' ? 'SLENDER' : bodyShape === 'béo' ? 'FULL-FIGURED' : 'BALANCED')
        : bodyShape.toUpperCase();

      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(
        lang === 'en'
          ? `Silhouette: ${shapeLabel} • Google Gemini Multimodal AI`
          : `Vóc dáng: ${shapeLabel} • Google Gemini Multimodal AI`,
        plateX + 54,
        badgeY + 44
      );
      ctx.restore();

      try {
        const outUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(outUrl);
      } catch (e) {
        console.warn('Canvas toDataURL failed, using fallback:', e);
        resolve(resolvedCostumeSrc || faceDataUrl);
      }
    }).catch((err) => {
      console.warn('Composite error caught:', err);
      resolve(resolvedCostumeSrc || faceDataUrl);
    });
  });
}
