import React, { useState, useEffect } from 'react';
import { COSTUMES_DATA, REGIONS_LIST, Costume } from './data/costumes';
import { COSTUME_BASE64_IMAGES } from './data/costumesImagesBase64';
import { AI_PROCESSING_PRESETS, ProcessingPreset } from './data/imagePresets';
import { CostumeImage } from './components/CostumeImage';
import { HomePage } from './components/HomePage';
import { ChatbotWidget } from './components/ChatbotWidget';
import { TRANSLATIONS, Language } from './i18n/translations';
import { getLocalizedCostume } from './i18n/costumeTranslations';
import {
  saveImageToStore,
  getImageFromStore,
  getAllImagesFromStore,
  syncServerImagesToStore,
  normalizeFileName,
} from './services/costumeImageStore';
import {
  generateVirtualTryOn,
  createCostumeImage,
  editCostumeImage,
  AIImageResult,
} from './services/gemini';

import brandLogoPng from './assets/viet-phuc-xanh-reu.png';

// Logo URL - Ảnh PNG chính thức của thương hiệu Việt phục
const BRAND_LOGO_URL = brandLogoPng;

// Default Model Faces for Virtual Try-On
const DEFAULT_FEMALE_FACE = "/default_female_face.jpg";
const DEFAULT_MALE_FACE = "/default_male_face.jpg";

// Preset Prompt Suggestions for Text-to-Image
const PROMPT_SUGGESTIONS = [
  {
    title: "Áo Dài Hà Thành hoa sen",
    prompt: "Chân dung thiếu nữ Hà Nội xưa thanh lịch trong tà áo dài lụa trắng tơ tằm mềm mại, tóc vấn đoan trang, tay nâng đóa hoa sen ngát hương bên hồ Gươm mờ sương sớm, phong cách nhiếp ảnh nghệ thuật chân thực hoài cổ.",
  },
  {
    title: "Áo Nhật Bình Cung Đình Huế",
    prompt: "Hoàng hậu triều Nguyễn uy nghi trong trang phục Áo Nhật Bình màu chu sa rực rỡ, dải ngũ sắc thêu chỉ kim tuyến vàng trước ngực, đội khăn vành xanh ngọc, đứng tại chính điện Thái Hòa cố đô Huế tráng lệ.",
  },
  {
    title: "Thiếu nữ H'Mông váy xòe hoa",
    prompt: "Thiếu nữ người H'Mông rạng rỡ diện váy xòe lanh dập ly vẽ sáp ong thổ cẩm sặc sỡ, áo ngắn xẻ ngực viền hoa văn tinh xảo, đeo vòng cổ bạc lấp lánh giữa phiên chợ vùng cao Sa Pa ngập sắc xuân.",
  },
  {
    title: "Áo Phi Ngư Phục Đại Việt",
    prompt: "Thị vệ cấm quân Đại Việt uy dũng trong trang phục Áo Phi Ngư Phục đỏ thêu rồng cá hóa rồng cuộn sóng bằng chỉ vàng kim, đai lưng ngọc, tay cầm trường kiếm đứng trang nghiêm trước cổng hoàng thành.",
  },
  {
    title: "Trang phục Nữ Dao Đỏ Hà Giang",
    prompt: "Cô gái Dao Đỏ trong bộ trang phục truyền thống đính chùm quả bông len đỏ rực rỡ trước ngực, mũ đội đầu hình chóp đính bạc chạm khắc, hoa văn chữ vạn thêu tay tỉ mỉ giữa ruộng bậc thang Hoàng Su Phì.",
  },
  {
    title: "Áo Bà Ba & Miệt Vườn Phương Nam",
    prompt: "Cô gái miền Tây duyên dáng trong chiếc áo bà ba màu hoa cà chít eo tôn dáng, quàng khăn rằn sọc ca rô, đội nón lá chèo xuồng ba lá lướt nhẹ trên dòng sông quê miệt vườn trĩu quả.",
  },
];

// Preset Edit Suggestions
const EDIT_SUGGESTIONS = [
  "Thêm nón quai thao truyền thống có dải lụa đào buông dài duyên dáng",
  "Chuyển phông nền sang không gian hoàng thành Huế cổ kính về đêm lung linh ánh đèn lồng",
  "Thêu thêm họa tiết chim phượng hoàng ngũ sắc bằng chỉ kim tuyến vàng trước ngực áo",
  "Thêm kiềng bạc chạm khắc hoa văn cổ truyền quanh cổ và hoa tai bạc",
  "Đổi màu vải tà áo sang màu xanh lam ngọc bích quý phái",
  "Thêm khăn rằn Nam Bộ đen trắng vắt qua vai và nón lá Việt Nam",
];

interface GeneratedHistoryItem {
  id: string;
  url: string;
  prompt: string;
  mode: 'create' | 'edit' | 'tryon';
  timestamp: string;
  sourceImage?: string;
  modelUsed?: string;
  backend?: string;
}

export default function App() {
  // Language State with persistence
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('vp_language');
      if (saved === 'en' || saved === 'vi') return saved;
    } catch {}
    return 'vi';
  });

  useEffect(() => {
    try {
      localStorage.setItem('vp_language', lang);
    } catch {}
  }, [lang]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.vi;

  // Navigation & Tab state
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'match' | 'ai'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Explore Tab State
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCostumeForModal, setSelectedCostumeForModal] = useState<Costume | null>(null);

  // Matching Tab State
  const [matchGender, setMatchGender] = useState<'female' | 'male'>('female');
  const [matchGroup, setMatchGroup] = useState<string>('any');
  const [matchStyle, setMatchStyle] = useState<string>('colorful');
  const [matchEvent, setMatchEvent] = useState<string>('wedding');
  const [matchAge, setMatchAge] = useState<string>('young');
  const [matchResult, setMatchResult] = useState<{
    bestCostume: Costume;
    confidence: number;
    top3: Array<{ costume: Costume; probability: number }>;
  } | null>(null);

  // AI Tab Sub-Mode: 'tryon' (Face try-on & creation) or 'edit_studio' (AI Image Processing Studio)
  const [aiSubMode, setAiSubMode] = useState<'tryon' | 'edit_studio'>('tryon');
  const [selectedEditCategory, setSelectedEditCategory] = useState<'accessories' | 'background' | 'enhance' | 'artistic'>('accessories');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('non_quai_thao');
  const [editSliderPosition, setEditSliderPosition] = useState<number>(50);
  const [editViewMode, setEditViewMode] = useState<'split' | 'single'>('split');
  const [showCostumePickerModal, setShowCostumePickerModal] = useState<boolean>(false);

  // AI Virtual Try-On & Image Generation State
  const [aiGender, setAiGender] = useState<'female' | 'male'>('female');
  const [aiSelectedCostume, setAiSelectedCostume] = useState<Costume>(
    COSTUMES_DATA.find(c => c.id === 'f_nhat_binh') || COSTUMES_DATA[0]
  );
  const [aiRegionFilter, setAiRegionFilter] = useState<string>('all');
  const [userFaceBase64, setUserFaceBase64] = useState<string | null>(null);
  const [bodyShape, setBodyShape] = useState<'gầy' | 'bình thường' | 'béo'>('bình thường');
  const [backgroundSetting, setBackgroundSetting] = useState<string>('Phố cổ Hội An đèn lồng hoa đăng rực rỡ');
  const [customStylingNote, setCustomStylingNote] = useState<string>('');
  const [tryOnAspectRatio, setTryOnAspectRatio] = useState<'3:4' | '1:1' | '9:16'>('3:4');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiLoadingStep, setAiLoadingStep] = useState<string>('');
  const [aiOutputImage, setAiOutputImage] = useState<string>(
    COSTUMES_DATA.find(c => c.id === 'f_nhat_binh')?.imageUrl || COSTUMES_DATA[0].imageUrl
  );
  const [aiNarrative, setAiNarrative] = useState<string>(() => {
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('vp_language') : 'vi';
    return savedLang === 'en'
      ? 'Rendered via Google Gemini Multimodal AI and historical archives, preserving natural facial expressions while faithfully reproducing traditional silk and brocade patterns.'
      : 'Ảnh được kết xuất bằng công nghệ phân tích thị giác AI kết hợp cùng tư liệu di sản, giữ nguyên thần thái khuôn mặt đồng thời tái hiện sống động sắc màu gấm vóc cổ truyền.';
  });

  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [hasGeneratedResult, setHasGeneratedResult] = useState<boolean>(false);
  const [imageFitMode, setImageFitMode] = useState<'contain' | 'cover'>('contain');

  useEffect(() => {
    if (!hasGeneratedResult) {
      setAiNarrative(
        lang === 'en'
          ? 'Rendered via Google Gemini Multimodal AI and historical archives, preserving natural facial expressions while faithfully reproducing traditional silk and brocade patterns.'
          : 'Ảnh được kết xuất bằng công nghệ phân tích thị giác AI kết hợp cùng tư liệu di sản, giữ nguyên thần thái khuôn mặt đồng thời tái hiện sống động sắc màu gấm vóc cổ truyền.'
      );
    }
  }, [lang, hasGeneratedResult]);

  // AI Image Processing & Edit State (gemini-3.1-flash-image)
  const [imagePrompt, setImagePrompt] = useState<string>(PROMPT_SUGGESTIONS[0].prompt);
  const [imageResolution, setImageResolution] = useState<'512px' | '1K' | '2K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '16:9' | '9:16'>('3:4');
  const [sourceEditImage, setSourceEditImage] = useState<string>(
    COSTUMES_DATA.find(c => c.id === 'f_nhat_binh')?.imageUrl || COSTUMES_DATA[0].imageUrl
  );
  const [editPrompt, setEditPrompt] = useState<string>(
    AI_PROCESSING_PRESETS[0].prompt
  );
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [imageProcessStep, setImageProcessStep] = useState<string>('');
  const [currentResultImage, setCurrentResultImage] = useState<string>(
    COSTUMES_DATA.find(c => c.id === 'f_nhat_binh')?.imageUrl || COSTUMES_DATA[0].imageUrl
  );
  const [resultMetadata, setResultMetadata] = useState<{
    modelUsed: string;
    backend: string;
    textResponse?: string;
  }>({
    modelUsed: 'gemini-3.1-flash-image',
    backend: 'Google Gemini AI',
    textResponse: 'Mô hình Google Gemini AI đã hòa trộn và xử lý hình ảnh chi tiết theo đặc tả phục trang truyền thống Việt Nam.',
  });
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);
  const [comparisonSlider, setComparisonSlider] = useState<number>(50);

  // History Gallery with LocalStorage persistence
  const [historyItems, setHistoryItems] = useState<GeneratedHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('vp_tryon_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('vp_tryon_history', JSON.stringify(historyItems));
    } catch {}
  }, [historyItems]);

  const [selectedHistoryItem, setSelectedHistoryItem] = useState<GeneratedHistoryItem | null>(null);

  // Intro Popup Modal State
  const [introModalOpen, setIntroModalOpen] = useState<boolean>(false);
  const [dontShowIntroAgain, setDontShowIntroAgain] = useState<boolean>(false);

  // In-app Toast Notification (Avoids window.alert)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3800);
  };

  // Batch Image Upload & Sync State
  const [loadedImagesCount, setLoadedImagesCount] = useState<number>(0);
  const [isUploadingBatch, setIsUploadingBatch] = useState<boolean>(false);
  const [forceRefreshKey, setForceRefreshKey] = useState<number>(0);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Custom Brand Logo State (Upload trực tiếp ảnh gốc như ảnh trang phục)
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  // Tự động kiểm tra, đồng bộ ảnh từ server và sao lưu ảnh từ browser lên server
  useEffect(() => {
    // 1. Tải toàn bộ ảnh đã lưu trên server về bộ nhớ client
    syncServerImagesToStore().then((count) => {
      if (count > 0) {
        setForceRefreshKey((prev) => prev + 1);
      }
    });

    // 2. Tự động kiểm tra và sao lưu vĩnh viễn các ảnh từ trình duyệt lên server
    getAllImagesFromStore().then(async (images) => {
      const keys = Object.keys(images);
      for (const key of keys) {
        const val = images[key];
        if (val && val.startsWith('data:')) {
          try {
            await fetch('/api/upload-single', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: key, dataUrl: val }),
            });
          } catch {}
        }
      }
    });

    // 3. Nạp ảnh logo chính thức
    getImageFromStore('viet-phuc-xanh-reu.png').then((stored) => {
      if (stored) {
        setCustomLogoUrl(stored);
      } else {
        getImageFromStore('site_logo').then((fallback) => {
          if (fallback) setCustomLogoUrl(fallback);
        });
      }
    });
  }, []);

  // Hàm tải thẳng ảnh logo lên trực tiếp (giữ nguyên bản 100% dữ liệu gốc của file ảnh)
  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 1. Cập nhật state UI ngay lập tức
      setCustomLogoUrl(dataUrl);

      // 2. Lưu trực tiếp vào IndexedDB của trình duyệt
      await saveImageToStore('viet-phuc-xanh-reu.png', dataUrl);
      await saveImageToStore('site_logo', dataUrl);

      // 3. Đồng bộ thẳng file gốc lên máy chủ server (public/ và src/assets/)
      await fetch('/api/upload-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: [
            { name: 'viet-phuc-xanh-reu.png', dataUrl },
            { name: file.name, dataUrl },
          ],
        }),
      }).catch(() => {});

      showToast("Đã tải ảnh logo lên thành công (100% tệp gốc)!");
    } catch (err) {
      console.error('Lỗi tải tệp logo:', err);
      showToast("Có lỗi xảy ra khi nạp tệp ảnh logo.");
    }
  };

  // Sync count on mount and refresh
  useEffect(() => {
    getAllImagesFromStore().then((images) => {
      setLoadedImagesCount(Object.keys(images).length);
    });
  }, [forceRefreshKey]);

  // Handler for batch uploading all 32 images
  const handleBatchFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setIsUploadingBatch(true);
    let matched = 0;
    const serverPayload: Array<{ name: string; dataUrl: string }> = [];

    for (const file of files) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const rawClean = file.name.trim();

        // Kiểm tra nếu tệp tải lên là ảnh logo thương hiệu
        if (
          rawClean.toLowerCase().includes('viet-phuc') ||
          rawClean.toLowerCase().includes('logo')
        ) {
          setCustomLogoUrl(dataUrl);
          await saveImageToStore('viet-phuc-xanh-reu.png', dataUrl);
          await saveImageToStore('site_logo', dataUrl);
          serverPayload.push({ name: 'viet-phuc-xanh-reu.png', dataUrl });
          matched++;
          continue;
        }

        const baseName = rawClean.replace(/\.[^/.]+$/, '').toLowerCase();

        const matchedCostume = COSTUMES_DATA.find((c) => {
          const cFile = c.fileName.toLowerCase();
          const cName = c.name.toLowerCase();
          return (
            normalizeFileName(c.fileName) === normalizeFileName(rawClean) ||
            cFile.includes(baseName) ||
            baseName.includes(cFile.replace(/\.[^/.]+$/, '')) ||
            cName.includes(baseName) ||
            baseName.includes(cName)
          );
        });

        const targetFileName = matchedCostume ? matchedCostume.fileName : rawClean;
        await saveImageToStore(targetFileName, dataUrl);
        serverPayload.push({ name: targetFileName, dataUrl });
        matched++;
      } catch (e) {
        console.warn('Error reading file', file.name, e);
      }
    }

    if (serverPayload.length > 0) {
      await fetch('/api/upload-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: serverPayload }),
      }).catch(() => {});
    }

    const allStored = await getAllImagesFromStore();
    setLoadedImagesCount(Object.keys(allStored).length);
    setForceRefreshKey((k) => k + 1);
    setIsUploadingBatch(false);
    setShowUploadModal(false);
    showToast(`Đã đồng bộ thành công ${matched} ảnh trang phục vào hệ thống!`);
  };

  // Check server status
  useEffect(() => {
    fetch('/api/status').catch(() => {});

    const hasSeen = localStorage.getItem('vietphuc_intro_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIntroModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseIntro = () => {
    if (dontShowIntroAgain) {
      localStorage.setItem('vietphuc_intro_seen', 'true');
    }
    setIntroModalOpen(false);
  };

  const navigateToTab = (tab: 'home' | 'explore' | 'match' | 'ai') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered costumes for Explore Tab
  const filteredCostumes = COSTUMES_DATA.filter((item) => {
    if (genderFilter !== 'all' && item.gender !== genderFilter) return false;
    if (regionFilter !== 'all' && !item.group.toLowerCase().includes(regionFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const loc = getLocalizedCostume(item, lang);
      const matchName = item.name.toLowerCase().includes(q) || loc.name.toLowerCase().includes(q);
      const matchEthnicity = item.ethnicity.toLowerCase().includes(q) || loc.ethnicity.toLowerCase().includes(q);
      const matchMeaning = item.meaning.toLowerCase().includes(q) || loc.meaning.toLowerCase().includes(q);
      const matchStructure = item.structure.toLowerCase().includes(q) || loc.structure.toLowerCase().includes(q);
      if (!matchName && !matchEthnicity && !matchMeaning && !matchStructure) return false;
    }
    return true;
  });

  // Calculate Bayesian Probability Match
  const handleCalculateProbability = () => {
    const candidates = COSTUMES_DATA.filter(c => c.gender === matchGender);

    const scored = candidates.map(c => {
      let weight = 1.0;
      if (matchGroup !== 'any') {
        weight *= c.group.toLowerCase().includes(matchGroup.toLowerCase()) ? 4.5 : 0.3;
      } else {
        weight *= 1.2;
      }

      if (c.styleKey === matchStyle) {
        weight *= 3.5;
      } else if (
        (matchStyle === 'simple' && c.styleKey === 'minimal') ||
        (matchStyle === 'minimal' && c.styleKey === 'simple') ||
        (matchStyle === 'intricate' && c.styleKey === 'colorful') ||
        (matchStyle === 'regal' && c.styleKey === 'intricate')
      ) {
        weight *= 2.0;
      } else {
        weight *= 0.6;
      }

      weight *= (c.eventKey === matchEvent) ? 3.0 : 0.7;
      weight *= (c.ageKey === matchAge) ? 2.5 : 0.8;

      return { costume: c, rawScore: weight };
    });

    scored.sort((a, b) => b.rawScore - a.rawScore);
    const totalScore = scored.reduce((sum, item) => sum + item.rawScore, 0);

    const topPick = scored[0];
    const confidence = Math.min(99, Math.round((topPick.rawScore / totalScore) * 100 * 1.4 + 45));

    const top3 = scored.slice(0, 3).map(item => ({
      costume: item.costume,
      probability: Math.round((item.rawScore / totalScore) * 100),
    }));

    setMatchResult({
      bestCostume: topPick.costume,
      confidence,
      top3,
    });
  };

  // Face upload handler
  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUserFaceBase64(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Source edit image upload handler
  const handleSourceEditUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSourceEditImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open detail modal when clicking on the preview image (or explicit "Chi tiết" button)
  const handleOpenCurrentDetail = () => {
    if (hasGeneratedResult) {
      const locCostume = getLocalizedCostume(aiSelectedCostume, lang);
      const shapeLabel = lang === 'en'
        ? (bodyShape === 'gầy' ? 'slender' : bodyShape === 'béo' ? 'full-figured' : 'balanced')
        : bodyShape;
      setSelectedHistoryItem({
        id: `current_${Date.now()}`,
        url: aiOutputImage,
        prompt: `${locCostume.name} • ${lang === 'en' ? 'Build: ' + shapeLabel : 'Dáng ' + bodyShape} • ${aiSelectedCostume.gender === 'male' ? (lang === 'en' ? 'Male' : 'Nam') : (lang === 'en' ? 'Female' : 'Nữ')} • ${aiNarrative}`,
        mode: 'tryon',
        timestamp: lang === 'en' ? 'Currently viewing' : 'Tác phẩm đang xem',
        modelUsed: 'gemini-3.1-flash-image',
        backend: 'Gemini Multimodal AI',
      });
    } else {
      setSelectedCostumeForModal(aiSelectedCostume);
    }
  };

  // AI Virtual Try-On & Image Generator
  const handleGenerateAITryOn = async () => {
    setIsGeneratingAI(true);
    const locCostume = getLocalizedCostume(aiSelectedCostume, lang);
    const shapeLabel = lang === 'en'
      ? (bodyShape === 'gầy' ? 'slender' : bodyShape === 'béo' ? 'full-figured' : 'balanced')
      : bodyShape;

    setAiLoadingStep(lang === 'en' ? "Analyzing facial features & portrait geometry..." : "Đang phân tích tỷ lệ ngũ quan & diện mạo khuôn mặt...");

    await new Promise(r => setTimeout(r, 600));
    setAiLoadingStep(
      lang === 'en'
        ? `Aligning patterns of [${locCostume.name}] with [${shapeLabel}] silhouette...`
        : `Đang đối chiếu hoa văn [${aiSelectedCostume.name}] với vóc dáng [${bodyShape}]...`
    );

    await new Promise(r => setTimeout(r, 700));
    setAiLoadingStep(lang === 'en' ? "Rendering artwork via Gemini Multimodal AI..." : `Đang kết xuất tác phẩm qua mô hình Gemini AI...`);

    try {
      // Quy tắc: Nếu người dùng tải ảnh lên thì dùng ảnh đó; nếu không tải thì đồ nam dùng mặt nam mặc định, đồ nữ dùng mặt nữ mặc định
      const rawFace = userFaceBase64 || (aiSelectedCostume.gender === 'male' ? DEFAULT_MALE_FACE : DEFAULT_FEMALE_FACE);
      const activeFace = await ensureBase64(rawFace);

      // Nạp ảnh mẫu trang phục sang base64 để Gemini nhận cả 2 ảnh tham chiếu
      let costumeBase64: string | undefined;
      try {
        const rawCostumeSrc = aiSelectedCostume.fileName || aiSelectedCostume.imageUrl;
        const res = await ensureBase64(rawCostumeSrc);
        if (res && res.startsWith('data:image/')) {
          costumeBase64 = res;
        }
      } catch (e) {
        console.warn('Could not convert costume to base64, proceeding with prompt description', e);
      }

      const result = await generateVirtualTryOn({
        faceImageBase64: activeFace,
        costumeImageBase64: costumeBase64,
        costume: aiSelectedCostume,
        bodyShape,
        backgroundSetting,
        customNote: customStylingNote.trim() || undefined,
        aspectRatio: tryOnAspectRatio,
        lang,
      });

      setAiOutputImage(result.imageUrl);
      setAiNarrative(result.narrative);
      setHasGeneratedResult(true);

      // Add to history
      setHistoryItems(prev => [
        {
          id: Date.now().toString(),
          url: result.imageUrl,
          prompt: `${locCostume.name} • ${lang === 'en' ? 'Build: ' + shapeLabel : 'Dáng ' + bodyShape} • ${aiSelectedCostume.gender === 'male' ? (lang === 'en' ? 'Male' : 'Nam') : (lang === 'en' ? 'Female' : 'Nữ')}`,
          mode: 'tryon',
          timestamp: new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: result.modelUsed || 'gemini-3.1-flash-image',
          backend: result.backend || 'Gemini Multimodal AI',
        },
        ...prev.slice(0, 11),
      ]);
      showToast(lang === 'en' ? `Successfully generated try-on for ${locCostume.name} with ${shapeLabel} build!` : `Đã tạo tác thành công ảnh ${aiSelectedCostume.name} với vóc dáng ${bodyShape}!`);
    } catch (err) {
      console.error("AI Generation error:", err);
      showToast(lang === 'en' ? "Generation error, displaying heritage sample." : "Có lỗi khi tạo ảnh bằng AI, hiển thị bản mô phỏng di sản.");
      setAiOutputImage(aiSelectedCostume.imageUrl);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Handle Text-to-Image Creation using gemini-3.1-flash-image
  const handleCreateImage = async () => {
    if (!imagePrompt.trim()) return;

    setIsProcessingImage(true);
    setImageProcessStep("Đang gửi câu lệnh đến gemini-3.1-flash-image...");

    await new Promise(r => setTimeout(r, 500));
    setImageProcessStep("Đang tạo tác hoa văn tơ lụa & màu sắc gấm vóc qua Google Gemini AI...");

    try {
      const result: AIImageResult = await createCostumeImage({
        prompt: imagePrompt,
        aspectRatio,
        imageSize: imageResolution,
      });

      if (result.success && result.imageUrl) {
        setCurrentResultImage(result.imageUrl);
        setResultMetadata({
          modelUsed: result.modelUsed || 'gemini-3.1-flash-image',
          backend: result.backend || 'Google Gemini AI',
          textResponse: result.textResponse,
        });

        // Add to history
        setHistoryItems(prev => [
          {
            id: Date.now().toString(),
            url: result.imageUrl,
            prompt: imagePrompt,
            mode: 'create',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            modelUsed: result.modelUsed || 'gemini-3.1-flash-image',
            backend: result.backend || 'Google Gemini AI',
          },
          ...prev.slice(0, 7),
        ]);
      } else {
        showToast(result.error || "Không thể tạo ảnh. Vui lòng kiểm tra lại câu lệnh.");
      }
    } catch (err: any) {
      console.error("Create image error:", err);
      showToast(err?.message || "Đã xảy ra lỗi khi tạo ảnh.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Helper to ensure an image source is in base64 dataUri format
  const ensureBase64 = async (imageSrc: string): Promise<string> => {
    if (!imageSrc) return '';
    if (imageSrc.startsWith('data:image/')) {
      return imageSrc;
    }

    // 1. Check IndexedDB image store first
    try {
      const stored = await getImageFromStore(imageSrc);
      if (stored && stored.startsWith('data:image/')) {
        return stored;
      }
    } catch {}

    // 2. Check COSTUME_BASE64_IMAGES constant
    try {
      const direct = COSTUME_BASE64_IMAGES[imageSrc] || COSTUME_BASE64_IMAGES[imageSrc.toLowerCase()];
      if (direct && direct.startsWith('data:image/')) {
        return direct;
      }
    } catch {}

    // 3. Fetch from public assets with URL encoding & content-type verification
    const cleanUrl = imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`;
    const candidates = [
      cleanUrl,
      encodeURI(cleanUrl),
      cleanUrl.toLowerCase(),
      encodeURI(cleanUrl.toLowerCase()),
    ];

    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.startsWith('image/')) {
            const blob = await res.blob();
            const dataUri = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string' && reader.result.startsWith('data:image/')) {
                  resolve(reader.result);
                } else {
                  resolve('');
                }
              };
              reader.onerror = () => resolve('');
              reader.readAsDataURL(blob);
            });
            if (dataUri) return dataUri;
          }
        }
      } catch (e) {
        console.warn('Fetch candidate failed:', url, e);
      }
    }

    // 4. Fallback via Image element into canvas
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 720;
          canvas.height = img.naturalHeight || img.height || 960;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
            return;
          }
        } catch (e) {
          console.warn('Canvas export failed:', e);
        }
        resolve('');
      };
      img.onerror = () => resolve('');
      img.src = encodeURI(cleanUrl);
    });
  };

  // Upload an arbitrary image to edit with AI
  const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setSourceEditImage(dataUrl);
          setCurrentResultImage(dataUrl);
          showToast("Đã nạp ảnh thành công! Hãy chọn tính năng hoặc câu lệnh xử lý.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Image Editing using gemini-3.1-flash-image
  const handleEditImage = async () => {
    if (!editPrompt.trim() || !sourceEditImage) {
      showToast("Vui lòng chọn ảnh nguồn và nhập câu lệnh xử lý.");
      return;
    }

    setIsProcessingImage(true);
    setImageProcessStep("Đang nạp ảnh nguồn và phân tích cấu trúc vùng ảnh...");

    await new Promise(r => setTimeout(r, 550));
    setImageProcessStep("Đang hòa trộn hoa văn di sản bằng mô hình Google Gemini AI...");

    try {
      const base64Data = await ensureBase64(sourceEditImage);
      const result: AIImageResult = await editCostumeImage({
        imageBase64: base64Data,
        prompt: editPrompt,
        aspectRatio,
      });

      if (result.success && result.imageUrl) {
        setCurrentResultImage(result.imageUrl);
        setResultMetadata({
          modelUsed: result.modelUsed || 'gemini-3.1-flash-image',
          backend: result.backend || 'Google Gemini AI',
          textResponse: result.textResponse,
        });

        // Add to history
        setHistoryItems(prev => [
          {
            id: Date.now().toString(),
            url: result.imageUrl,
            sourceImage: sourceEditImage,
            prompt: `Xử lý AI: ${editPrompt.slice(0, 45)}...`,
            mode: 'edit',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            modelUsed: result.modelUsed || 'gemini-3.1-flash-image',
            backend: result.backend || 'Google Gemini AI',
          },
          ...prev.slice(0, 11),
        ]);
        showToast("Đã xử lý ảnh thành công bằng Gemini AI!");
      } else {
        showToast(result.error || "Không thể xử lý ảnh. Vui lòng kiểm tra lại ảnh nguồn hoặc câu lệnh.");
      }
    } catch (err: any) {
      console.error("Edit image error:", err);
      showToast(err?.message || "Đã xảy ra lỗi khi xử lý ảnh.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Transfer costume from Explore/Matching to AI Studio
  const handleTransferToAI = (costume: Costume) => {
    setAiGender(costume.gender);
    setAiSelectedCostume(costume);
    setSelectedCostumeForModal(null);
    setSourceEditImage(costume.imageUrl);
    navigateToTab('ai');
    const loc = getLocalizedCostume(costume, lang);
    showToast(lang === 'en' ? `Switched to AI Try-on with [${loc.name}]!` : `Đã chuyển sang thử đồ với [${costume.name}]!`);
  };

  // Download rendered image with cross-origin & data URI support
  const handleDownloadImage = async (url: string, name: string) => {
    try {
      const cleanName = (name || 'viet_phuc').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanName}_${Date.now()}.png`;

      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("Đã tải ảnh về thiết bị của bạn thành công!");
        return;
      }

      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2500);
      showToast("Đã tải ảnh về thiết bị của bạn thành công!");
    } catch {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(name || 'viet_phuc').replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.png`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("Đang tải ảnh xuống máy của bạn...");
    }
  };

  // Share rendered result
  const handleShareImage = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Việt Phục AI Studio - Tác phẩm phục trang',
        text: 'Chiêm ngưỡng tác phẩm trang phục truyền thống Việt Nam tạo bởi Gemini AI!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép liên kết vào bộ nhớ tạm!");
    }
  };

  return (
    <div className="bg-[#FDFBF7] text-[#1E293B] font-sans min-h-screen flex flex-col antialiased selection:bg-[#D97706] selection:text-white">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & NAVIGATION                                */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#D97706]/30 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name (Cố định & Khóa chỉnh sửa) */}
          <button 
            onClick={() => navigateToTab('home')}
            className={`flex items-center cursor-pointer p-1.5 -ml-1.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#1C3F34]/20 text-left ${
              currentTab === 'home' ? 'bg-[#1C3F34]/5' : 'hover:bg-[#1C3F34]/5'
            }`}
            title="Trang Chủ - Việt Phục"
            aria-label="Về Trang Chủ Việt Phục"
          >
            <img 
              src={customLogoUrl || BRAND_LOGO_URL} 
              alt="Việt phục" 
              className="h-9 sm:h-12 w-auto max-w-[210px] sm:max-w-[260px] object-contain transition-transform hover:scale-102"
              loading="eager"
            />
          </button>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => navigateToTab('explore')}
              className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === 'explore'
                  ? 'text-[#8B1E1E] bg-[#8B1E1E]/10 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5'
              }`}
            >
              <i className="fa-solid fa-compass"></i>
              <span>{t.nav_explore}</span>
            </button>
            <button
              onClick={() => navigateToTab('match')}
              className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === 'match'
                  ? 'text-[#8B1E1E] bg-[#8B1E1E]/10 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5'
              }`}
            >
              <i className="fa-solid fa-scale-balanced"></i>
              <span>{t.nav_match}</span>
            </button>
            <button
              onClick={() => navigateToTab('ai')}
              className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === 'ai'
                  ? 'text-[#8B1E1E] bg-[#8B1E1E]/10 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5'
              }`}
            >
              <i className="fa-solid fa-expand text-[#D97706]"></i>
              <span>{t.nav_ai}</span>
            </button>
          </nav>

          {/* Action Info Button ("i") & Language Switcher & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Pill Button (Next to Info button) */}
            <div className="flex items-center bg-[#F4EFE6] rounded-full p-0.5 border border-[#D97706]/40 text-xs font-bold shadow-2xs">
              <button
                onClick={() => setLang('vi')}
                className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'vi' ? 'bg-[#8B1E1E] text-white shadow-xs' : 'text-slate-600 hover:text-[#8B1E1E]'
                }`}
                title="Tiếng Việt"
              >
                <span>🇻🇳</span>
                <span className="text-[11px]">VI</span>
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'en' ? 'bg-[#8B1E1E] text-white shadow-xs' : 'text-slate-600 hover:text-[#8B1E1E]'
                }`}
                title="English"
              >
                <span>🇬🇧</span>
                <span className="text-[11px]">EN</span>
              </button>
            </div>

            <button
              onClick={() => setIntroModalOpen(true)}
              title={t.intro_tooltip}
              className="relative p-2.5 rounded-full bg-[#D97706]/15 text-[#D97706] hover:bg-[#D97706] hover:text-white transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D97706]"
            >
              <i className="fa-solid fa-info text-base font-bold w-5 h-5 flex items-center justify-center"></i>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-[#8B1E1E] cursor-pointer"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 border-t border-[#D97706]/20 bg-[#F4EFE6] space-y-2">
            <button
              onClick={() => navigateToTab('home')}
              className={`w-full text-left px-3 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
                currentTab === 'home' ? 'text-[#8B1E1E] bg-[#8B1E1E]/10 font-bold' : 'text-slate-700'
              }`}
            >
              <i className="fa-solid fa-house"></i> {t.nav_home}
            </button>
            <button
              onClick={() => navigateToTab('explore')}
              className={`w-full text-left px-3 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
                currentTab === 'explore' ? 'text-[#8B1E1E] bg-[#8B1E1E]/10 font-bold' : 'text-slate-700'
              }`}
            >
              <i className="fa-solid fa-compass"></i> {t.nav_explore}
            </button>
            <button
              onClick={() => navigateToTab('match')}
              className={`w-full text-left px-3 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
                currentTab === 'match' ? 'text-[#8B1E1E] bg-[#8B1E1E]/10 font-bold' : 'text-slate-700'
              }`}
            >
              <i className="fa-solid fa-scale-balanced"></i> {t.nav_match}
            </button>
            <button
              onClick={() => navigateToTab('ai')}
              className={`w-full text-left px-3 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
                currentTab === 'ai' ? 'text-[#8B1E1E] bg-[#8B1E1E]/10 font-bold' : 'text-slate-700'
              }`}
            >
              <i className="fa-solid fa-expand text-[#D97706]"></i> {t.nav_ai}
            </button>

            {/* Mobile Language Selector */}
            <div className="pt-2 border-t border-[#D97706]/20 flex items-center justify-between px-3 text-xs">
              <span className="text-slate-600 font-bold">{lang === 'vi' ? 'Ngôn ngữ:' : 'Language:'}</span>
              <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-slate-300">
                <button
                  type="button"
                  onClick={() => setLang('vi')}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    lang === 'vi' ? 'bg-[#8B1E1E] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  🇻🇳 VI
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    lang === 'en' ? 'bg-[#8B1E1E] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN BODY CONTENT                                      */}
      {/* ========================================================= */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* ========================================================= */}
        {/* TAB 0: TRANG CHỦ (HOME PAGE)                              */}
        {/* ========================================================= */}
        {currentTab === 'home' && (
          <HomePage
            onNavigate={navigateToTab}
            onOpenCostumeModal={(costume) => setSelectedCostumeForModal(costume)}
            lang={lang}
          />
        )}

        {/* ========================================================= */}
        {/* TAB 1: TÌM HIỂU CHUNG (EXPLORE)                           */}
        {/* ========================================================= */}
        {currentTab === 'explore' && (
          <section className="space-y-8 animate-fadeIn">
            {/* Header Banner */}
            <div className="relative bg-gradient-to-r from-[#631313] via-[#8B1E1E] to-[#78350F] rounded-2xl p-6 md:p-10 text-white shadow-xl overflow-hidden border border-[#D97706]/30">
              <div className="absolute inset-0 opacity-10 heritage-border-pattern pointer-events-none"></div>
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D97706]/20 text-[#FDE68A] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#D97706]/30">
                  <i className="fa-solid fa-landmark"></i> {lang === 'vi' ? 'Kho Tàng Di Sản Bách Việt' : 'Heritage Treasury'}
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {t.explore_header_title}
                </h1>
                <p className="text-[#F4EFE6]/90 text-sm sm:text-base leading-relaxed">
                  {t.explore_header_desc}
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 md:p-6 border border-[#D97706]/25 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Gender Switcher */}
                <div className="flex items-center bg-[#F4EFE6] rounded-lg p-1 border border-[#D97706]/30 w-full sm:w-auto">
                  <button
                    onClick={() => setGenderFilter('all')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      genderFilter === 'all'
                        ? 'bg-[#8B1E1E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#8B1E1E]'
                    }`}
                  >
                    {t.filter_all_gender}
                  </button>
                  <button
                    onClick={() => setGenderFilter('female')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      genderFilter === 'female'
                        ? 'bg-[#8B1E1E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#8B1E1E]'
                    }`}
                  >
                    <i className="fa-solid fa-venus mr-1.5"></i>
                    {t.filter_female}
                  </button>
                  <button
                    onClick={() => setGenderFilter('male')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      genderFilter === 'male'
                        ? 'bg-[#8B1E1E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#8B1E1E]'
                    }`}
                  >
                    <i className="fa-solid fa-mars mr-1.5"></i>
                    {t.filter_male}
                  </button>
                </div>

                {/* Region Select */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap hidden lg:inline">
                    {lang === 'vi' ? 'Khu vực:' : 'Region:'}
                  </span>
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="w-full sm:w-auto bg-white border border-[#D97706]/40 text-slate-800 text-sm rounded-lg px-3 py-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] shadow-xs cursor-pointer"
                  >
                    {REGIONS_LIST.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {lang === 'en' ? reg.nameEn : reg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.search_placeholder}
                    className="w-full pl-9 pr-4 py-2 bg-white text-sm border border-[#D97706]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] shadow-xs"
                  />
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
                </div>
              </div>
            </div>

            {/* Costumes Grid */}
            {filteredCostumes.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <i className="fa-solid fa-box-open text-4xl mb-3"></i>
                <p className="font-medium text-sm">{t.no_results_found}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCostumes.map((item) => {
                  const locItem = getLocalizedCostume(item, lang);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCostumeForModal(item)}
                      className="bg-white rounded-2xl border border-[#D97706]/30 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                    >
                      <div className="w-full aspect-[4/5] bg-[#F4EFE6] overflow-hidden relative">
                        <CostumeImage
                          key={`${item.fileName}_${forceRefreshKey}`}
                          src={item.fileName}
                          fileName={item.fileName}
                          alt={locItem.name}
                          name={locItem.name}
                          ethnicity={locItem.ethnicity}
                          accentColor={item.accentColor}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onImageUploaded={() => {
                            setForceRefreshKey((k) => k + 1);
                            getAllImagesFromStore().then((imgs) =>
                              setLoadedImagesCount(Object.keys(imgs).length)
                            );
                          }}
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                              item.gender === 'female'
                                ? 'bg-rose-950/80 text-rose-100'
                                : 'bg-slate-950/80 text-sky-100'
                            }`}
                          >
                            {item.gender === 'female' ? (
                              <>
                                <i className="fa-solid fa-venus mr-1"></i>{t.card_female}
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-mars mr-1"></i>{t.card_male}
                              </>
                            )}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-[#FDE68A] backdrop-blur-md">
                            {locItem.group}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] font-semibold text-[#D97706] uppercase tracking-wider">
                            {locItem.ethnicity}
                          </p>
                          <h3 className="font-serif text-lg font-bold text-[#1E293B] group-hover:text-[#8B1E1E] transition-colors line-clamp-1 mt-0.5">
                            {locItem.name}
                          </h3>
                          <p className="text-slate-600 text-xs line-clamp-2 mt-1.5 leading-relaxed">
                            {locItem.meaning}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#8B1E1E] font-semibold">
                          <span>{t.card_view_details}</span>
                          <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PHỐI ĐỒ XÁC SUẤT (MATCHING)                        */}
        {/* ========================================================= */}
        {currentTab === 'match' && (
          <section className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D97706]/20 text-[#D97706] mb-3">
                <i className="fa-solid fa-feather text-xl"></i>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#8B1E1E]">
                {t.match_header_title}
              </h2>
              <p className="text-slate-600 text-sm md:text-base mt-2 max-w-xl mx-auto">
                {t.match_header_desc}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Questionnaire Form */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#D97706]/30 shadow-md space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B1E1E] text-white text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    {t.match_step1_label}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMatchGender('female')}
                      className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        matchGender === 'female'
                          ? 'border-[#8B1E1E] bg-[#8B1E1E]/10 text-[#8B1E1E]'
                          : 'border-slate-200 hover:border-[#D97706] text-slate-700'
                      }`}
                    >
                      <i className="fa-solid fa-venus"></i> {t.match_gender_female}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchGender('male')}
                      className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        matchGender === 'male'
                          ? 'border-[#8B1E1E] bg-[#8B1E1E]/10 text-[#8B1E1E]'
                          : 'border-slate-200 hover:border-[#D97706] text-slate-700'
                      }`}
                    >
                      <i className="fa-solid fa-mars"></i> {t.match_gender_male}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B1E1E] text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    {t.match_step2_label}
                  </label>
                  <select
                    value={matchGroup}
                    onChange={(e) => setMatchGroup(e.target.value)}
                    className="w-full bg-[#F4EFE6]/50 border border-[#D97706]/40 text-slate-800 text-sm rounded-xl p-3 focus:ring-2 focus:ring-[#8B1E1E] focus:outline-none cursor-pointer"
                  >
                    <option value="any">{lang === 'vi' ? 'Tất cả nhóm (Không giới hạn)' : 'All regions (Unrestricted)'}</option>
                    <option value="Cung đình">{lang === 'vi' ? 'Cung đình & Quý phái lịch sử (Triều Nguyễn / Đại Việt)' : 'Imperial & Court Nobility (Nguyen / Dai Viet)'}</option>
                    <option value="Đồng bằng Bắc Bộ">{lang === 'vi' ? 'Đồng bằng Bắc Bộ (Áo Dài, Áo Yếm, Ngũ Thân)' : 'Northern Delta (Ao Dai, Ao Yem, Ngu Than)'}</option>
                    <option value="Tây Bắc">{lang === 'vi' ? 'Tây Bắc (Thái hoa ban, Mường cổ)' : 'Northwest Highlands (Thai, Muong)'}</option>
                    <option value="Núi cao">{lang === 'vi' ? 'Núi cao rực rỡ (H\'Mông, Dao Đỏ)' : 'Vibrant Highlands (Hmong, Red Dao)'}</option>
                    <option value="Tây Nguyên">{lang === 'vi' ? 'Tây Nguyên cồng chiêng (Thổ cẩm đại ngàn)' : 'Central Highlands (Gong Culture Brocade)'}</option>
                    <option value="Nam Bộ">{lang === 'vi' ? 'Nam Bộ mộc mạc (Bà Ba, Khăn Rằn)' : 'Southern Riverlands (Ba Ba, Bandana)'}</option>
                    <option value="Duyên hải Nam Trung Bộ">{lang === 'vi' ? 'Duyên hải Champa huyền bí cổ kính' : 'Coastal Champa Heritage'}</option>
                    <option value="Đô thị">{lang === 'vi' ? 'Đô thị truyền thống (Người Hoa, Sườn xám)' : 'Traditional Urban (Cheongsam, Hoa ethnicity)'}</option>
                    <option value="Đông Bắc">{lang === 'vi' ? 'Đông Bắc (Tày, Nùng chàm bình dị)' : 'Northeast (Tay, Nung Indigo)'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B1E1E] text-white text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    {t.match_step5_label}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'colorful', label: t.match_style_colorful },
                      { key: 'minimal', label: lang === 'vi' ? 'Ít màu, bình dị' : 'Subtle, understated' },
                      { key: 'intricate', label: t.match_style_intricate },
                      { key: 'simple', label: t.match_style_simple },
                      { key: 'easy', label: t.match_style_easy },
                      { key: 'regal', label: t.match_style_regal },
                    ].map((style) => (
                      <button
                        key={style.key}
                        type="button"
                        onClick={() => setMatchStyle(style.key)}
                        className={`p-2.5 text-center text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          matchStyle === style.key
                            ? 'border-[#8B1E1E] bg-[#8B1E1E] text-white font-bold'
                            : 'border-slate-200 hover:border-[#D97706] text-slate-700'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B1E1E] text-white text-xs flex items-center justify-center font-bold">
                      4
                    </span>
                    {t.match_step3_label}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'wedding', label: t.match_event_wedding, icon: 'fa-heart' },
                      { key: 'festival', label: t.match_event_festival, icon: 'fa-flag' },
                      { key: 'photoshoot', label: t.match_event_photoshoot, icon: 'fa-camera' },
                      { key: 'daily', label: t.match_event_daily, icon: 'fa-sun' },
                    ].map((event) => (
                      <button
                        key={event.key}
                        type="button"
                        onClick={() => setMatchEvent(event.key)}
                        className={`p-2.5 text-center text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          matchEvent === event.key
                            ? 'border-[#D97706] bg-[#D97706] text-white font-bold'
                            : 'border-slate-200 hover:border-[#D97706] text-slate-700'
                        }`}
                      >
                        <i className={`fa-solid ${event.icon} mr-1`}></i>
                        {event.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B1E1E] text-white text-xs flex items-center justify-center font-bold">
                      5
                    </span>
                    {t.match_step4_label}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'kid', label: t.match_age_kid },
                      { key: 'young', label: t.match_age_young },
                      { key: 'adult', label: t.match_age_adult },
                      { key: 'senior', label: t.match_age_senior },
                    ].map((age) => (
                      <button
                        key={age.key}
                        type="button"
                        onClick={() => setMatchAge(age.key)}
                        className={`p-2.5 text-center text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          matchAge === age.key
                            ? 'border-[#0F766E] bg-[#0F766E] text-white font-bold'
                            : 'border-slate-200 hover:border-[#0F766E] text-slate-700'
                        }`}
                      >
                        {age.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCalculateProbability}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8B1E1E] to-[#631313] text-white font-bold text-base shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-calculator"></i>
                  <span>{t.match_btn_calculate}</span>
                </button>
              </div>

              {/* Result Preview Panel */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl p-6 border-2 border-[#D97706]/40 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#D97706] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {lang === 'vi' ? 'Độ Tương Thích Cao Nhất' : 'Highest Compatibility'}
                  </div>

                  {!matchResult ? (
                    <div className="text-center py-12 text-slate-400">
                      <i className="fa-solid fa-shirt text-5xl mb-3 text-[#D97706]/40"></i>
                      <p className="text-sm font-medium">
                        {lang === 'vi'
                          ? 'Chọn các tiêu chí bên cạnh và nhấn "Tính Toán Xác Suất" để nhận gợi ý chính xác nhất.'
                          : 'Select your preferences on the left and click "Calculate Compatibility Probability" to receive recommendations.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(() => {
                        const bestLc = getLocalizedCostume(matchResult.bestCostume, lang);
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                {matchResult.confidence}% {lang === 'vi' ? 'Phù Hợp' : 'Match'}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {bestLc.group} • {matchResult.bestCostume.gender === 'female' ? t.card_female : t.card_male}
                              </span>
                            </div>

                            <div className="w-full h-64 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner relative group">
                              <CostumeImage
                                src={matchResult.bestCostume.fileName}
                                alt={bestLc.name}
                                name={bestLc.name}
                                ethnicity={bestLc.ethnicity}
                                accentColor={matchResult.bestCostume.accentColor}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>

                            <div>
                              <h3 className="font-serif text-2xl font-bold text-[#8B1E1E]">
                                {bestLc.name}
                              </h3>
                              <p className="text-xs font-semibold text-[#D97706] uppercase tracking-wider mt-0.5">
                                {bestLc.ethnicity}
                              </p>
                            </div>

                            <div className="bg-[#F4EFE6]/70 rounded-xl p-3.5 text-xs text-slate-700 space-y-2 border border-[#D97706]/20 leading-relaxed">
                              <p><strong>{lang === 'vi' ? 'Cấu tạo:' : 'Structure:'}</strong> {bestLc.structure}</p>
                              <p><strong>{lang === 'vi' ? 'Dịp lễ:' : 'Occasions:'}</strong> {bestLc.events}</p>
                              <p><strong>{lang === 'vi' ? 'Ý nghĩa:' : 'Meaning:'}</strong> {bestLc.meaning}</p>
                            </div>
                          </>
                        );
                      })()}

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleTransferToAI(matchResult.bestCostume)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-[#D97706] hover:bg-amber-600 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <i className="fa-solid fa-wand-magic-sparkles"></i> {t.match_try_now_btn}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCostumeForModal(matchResult.bestCostume)}
                          className="py-2.5 px-3 rounded-xl border border-[#8B1E1E] text-[#8B1E1E] hover:bg-[#8B1E1E]/5 text-xs font-semibold cursor-pointer"
                        >
                          {lang === 'vi' ? 'Chi tiết' : 'Details'}
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          {t.match_top3_label}
                        </div>
                        <div className="space-y-2">
                          {matchResult.top3.map((item, idx) => {
                            const topLc = getLocalizedCostume(item.costume, lang);
                            return (
                              <div
                                key={item.costume.id}
                                onClick={() => setSelectedCostumeForModal(item.costume)}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-amber-50/50 border border-slate-100 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2 truncate max-w-[220px]">
                                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                                    #{idx + 1}
                                  </span>
                                  <span className="text-xs font-medium text-slate-800 truncate">
                                    {topLc.name}
                                  </span>
                                </div>
                                <span className="font-bold text-xs text-[#8B1E1E]">
                                  {item.probability}% P(C|E)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#F4EFE6]/80 rounded-xl p-4 border border-[#D97706]/30 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <div className="font-bold text-[#631313] flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-nodes"></i> {lang === 'vi' ? 'Thuật toán xác suất có điều kiện (Bayesian Matching)' : 'Conditional Probability (Bayesian Matching)'}
                  </div>
                  <p>
                    {lang === 'vi'
                      ? <>Hệ thống chuẩn hoá trọng số tương thích: <code className="bg-white/80 px-1 py-0.5 rounded text-[#8B1E1E] font-mono">P(TrangPhục | GiớiTính, Nhóm, PhongCách, SựKiện, ĐộTuổi)</code> dựa trên các đặc tính trường trong tài liệu di sản.</>
                      : <>Compatibility weighting normalized via: <code className="bg-white/80 px-1 py-0.5 rounded text-[#8B1E1E] font-mono">P(Costume | Gender, Region, Style, Event, Age)</code> grounded in heritage archive metadata.</>}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 3: AI VIRTUAL TRY-ON & CREATE / EDIT IMAGES           */}
        {/* ========================================================= */}
        {currentTab === 'ai' && (
          <section className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            {/* Header banner */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B1E1E]/10 text-[#8B1E1E] mb-1">
                <i className="fa-solid fa-wand-magic-sparkles text-xl text-[#D97706]"></i>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#8B1E1E]">
                {t.ai_header_title}
              </h2>
              <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
                {t.ai_header_desc}
              </p>
              <div className="inline-flex items-start sm:items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50/95 border border-amber-300/80 text-amber-900 text-xs sm:text-[13px] max-w-3xl mx-auto text-left shadow-2xs">
                <i className="fa-solid fa-circle-exclamation text-amber-600 text-base flex-shrink-0 mt-0.5 sm:mt-0"></i>
                <p className="leading-relaxed">
                  <strong className="font-bold text-amber-950">{t.ai_warning_title}</strong> {t.ai_warning_desc}
                </p>
              </div>
            </div>

            {/* ========================================================= */}
            {/* VIRTUAL TRY-ON & AI COSTUME CREATION (3 STEPS)           */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
              {/* Left Column: 3-Step Setup Form */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#D97706]/30 shadow-md space-y-7">
                {/* STEP 1: Khuôn mặt (Face Selection & Upload) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#8B1E1E] text-white text-xs flex items-center justify-center font-bold shadow-xs">
                        1
                      </span>
                      <span>{t.ai_step1_title}</span>
                    </label>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        userFaceBase64
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {userFaceBase64
                        ? t.ai_step1_uploaded
                        : `${t.ai_step1_default} (${aiSelectedCostume.gender === 'male' ? t.card_male : t.card_female})`}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FDFBF7] p-3.5 rounded-xl border border-[#D97706]/25">
                    <div className="w-24 h-24 rounded-2xl border-2 border-[#D97706] overflow-hidden bg-[#F4EFE6] flex-shrink-0 relative group shadow-md flex items-center justify-center">
                      <img
                        src={userFaceBase64 || (aiSelectedCostume.gender === 'male' ? DEFAULT_MALE_FACE : DEFAULT_FEMALE_FACE)}
                        alt={t.ai_step1_title}
                        className="w-full h-full object-cover"
                      />
                      <label 
                        htmlFor="face-upload-input"
                        title={lang === 'vi' ? 'Tải ảnh khuôn mặt khác' : 'Upload different face portrait'}
                        className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer text-white text-xs font-bold gap-1"
                      >
                        <i className="fa-solid fa-camera text-base"></i>
                        <span>{lang === 'vi' ? 'Đổi ảnh' : 'Change'}</span>
                      </label>
                    </div>

                    <div className="space-y-2 flex-grow w-full">
                      <input
                        id="face-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFaceUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="face-upload-input"
                        className="w-full py-2.5 px-4 rounded-xl border border-[#D97706]/50 bg-white hover:bg-[#F4EFE6] text-xs font-bold text-[#8B1E1E] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                      >
                        <i className="fa-solid fa-cloud-arrow-up text-[#D97706]"></i>
                        <span>{t.ai_step1_upload_btn}</span>
                      </label>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                        <span className="font-medium">
                          {userFaceBase64 ? (lang === 'vi' ? 'Đang dùng ảnh khuôn mặt bạn' : 'Using your uploaded face') : (lang === 'vi' ? 'Chưa tải ảnh? Tự động dùng mặt mẫu:' : 'Default model face:')}
                        </span>
                        <div className="flex items-center gap-2">
                          {userFaceBase64 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setUserFaceBase64(null);
                                showToast(lang === 'vi' ? 'Đã xóa ảnh tải lên, chuyển về dùng ảnh mẫu mặc định theo trang phục.' : 'Reset to default face model.');
                              }}
                              className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                            >
                              <i className="fa-solid fa-rotate-left mr-1"></i>
                              {t.ai_step1_reset_btn}
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setUserFaceBase64(null);
                                  setAiGender('female');
                                  const firstFemale = COSTUMES_DATA.find(c => c.gender === 'female');
                                  if (firstFemale) setAiSelectedCostume(firstFemale);
                                }}
                                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                  aiSelectedCostume.gender === 'female'
                                    ? 'bg-[#8B1E1E] text-white border-[#8B1E1E]'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#D97706]'
                                }`}
                              >
                                <i className="fa-solid fa-venus mr-1"></i> {t.ai_step1_female_btn}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setUserFaceBase64(null);
                                  setAiGender('male');
                                  const firstMale = COSTUMES_DATA.find(c => c.gender === 'male');
                                  if (firstMale) setAiSelectedCostume(firstMale);
                                }}
                                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                  aiSelectedCostume.gender === 'male'
                                    ? 'bg-[#8B1E1E] text-white border-[#8B1E1E]'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#D97706]'
                                }`}
                              >
                                <i className="fa-solid fa-mars mr-1"></i> {t.ai_step1_male_btn}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 2: Chọn Trang Phục Cổ Truyền Di Sản (Costume Selection) */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#8B1E1E] text-white text-xs flex items-center justify-center font-bold shadow-xs">
                        2
                      </span>
                      <span>{t.ai_step2_title}</span>
                    </label>

                    <div className="flex items-center gap-2">
                      {/* Gender Selector */}
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-xs bg-slate-50">
                        <button
                          type="button"
                          onClick={() => {
                            setAiGender('female');
                            const firstFemale = COSTUMES_DATA.find(c => c.gender === 'female');
                            if (firstFemale) setAiSelectedCostume(firstFemale);
                          }}
                          className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                            aiGender === 'female' ? 'bg-white text-[#8B1E1E] shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          🌸 {t.modal_gender_female} ({COSTUMES_DATA.filter(c => c.gender === 'female').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAiGender('male');
                            const firstMale = COSTUMES_DATA.find(c => c.gender === 'male');
                            if (firstMale) setAiSelectedCostume(firstMale);
                          }}
                          className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                            aiGender === 'male' ? 'bg-white text-[#8B1E1E] shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          🌿 {t.modal_gender_male} ({COSTUMES_DATA.filter(c => c.gender === 'male').length})
                        </button>
                      </div>

                      {/* Region Filter */}
                      <select
                        value={aiRegionFilter}
                        onChange={(e) => setAiRegionFilter(e.target.value)}
                        className="text-xs bg-[#F4EFE6]/60 border border-[#D97706]/40 rounded-lg px-2.5 py-1 text-slate-800 focus:ring-1 focus:ring-[#8B1E1E] cursor-pointer"
                      >
                        <option value="all">{t.all_regions}</option>
                        {REGIONS_LIST.filter(r => r.id !== 'all').map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {lang === 'en' ? reg.nameEn : reg.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Costume Gallery Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1 border border-slate-100 rounded-xl p-2 bg-[#FAF7F2]">
                    {COSTUMES_DATA.filter((c) => {
                      const matchGender = c.gender === aiGender;
                      const matchRegion = aiRegionFilter === 'all' || c.group.toLowerCase().includes(aiRegionFilter.toLowerCase());
                      return matchGender && matchRegion;
                    }).map((c) => {
                      const cLc = getLocalizedCostume(c, lang);
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setAiSelectedCostume(c);
                            setAiGender(c.gender);
                            if (!hasGeneratedResult) {
                              setAiOutputImage(c.imageUrl);
                            }
                          }}
                          className={`p-2 rounded-xl border-2 transition-all flex items-center gap-2.5 cursor-pointer bg-white ${
                            aiSelectedCostume.id === c.id
                              ? 'border-[#8B1E1E] bg-[#8B1E1E]/5 shadow-sm ring-1 ring-[#8B1E1E]'
                              : 'border-slate-200/80 hover:border-[#D97706]'
                          }`}
                        >
                          <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                            <CostumeImage
                              src={c.fileName}
                              alt={cLc.name}
                              name={cLc.name}
                              accentColor={c.accentColor}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="overflow-hidden min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="text-xs font-bold text-slate-800 truncate">{cLc.name}</h4>
                              <span className={`text-[9px] px-1 rounded font-bold ${c.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                {c.gender === 'female' ? t.card_female : t.card_male}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">{cLc.group}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Costume Info Summary */}
                  <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#D97706]/35 flex items-center justify-between gap-3 text-xs">
                    {(() => {
                      const selCostumeLc = getLocalizedCostume(aiSelectedCostume, lang);
                      return (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: aiSelectedCostume.accentColor }}></span>
                          <div className="truncate">
                            <span className="font-bold text-slate-800">{selCostumeLc.name}</span>
                            <span className="text-slate-500 ml-1">({selCostumeLc.ethnicity} • {aiSelectedCostume.gender === 'female' ? t.modal_gender_female : t.modal_gender_male})</span>
                          </div>
                        </div>
                      );
                    })()}
                    <span className="text-[11px] font-semibold text-[#8B1E1E] whitespace-nowrap bg-white px-2 py-0.5 rounded border border-amber-200">
                      {lang === 'vi' ? 'Mẫu ảnh sẵn có trong di sản' : 'Heritage archive sample'}
                    </span>
                  </div>
                </div>

                {/* STEP 3: Vóc dáng (Gầy, Bình thường, Béo) & Bối cảnh */}
                <div className="space-y-4 pt-1 border-t border-slate-100">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#8B1E1E] text-white text-xs flex items-center justify-center font-bold shadow-xs">
                      3
                    </span>
                    <span>{t.ai_step3_title}</span>
                  </label>

                  {/* 3.1 Dáng người (Body Shape) */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t.ai_shape_label}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'gầy', label: t.ai_shape_slender, sub: lang === 'vi' ? 'Mảnh mai, thon thả' : 'Slim, graceful', icon: 'fa-feather' },
                        { key: 'bình thường', label: t.ai_shape_average, sub: lang === 'vi' ? 'Cân đối, chuẩn mực' : 'Harmonious, standard', icon: 'fa-person' },
                        { key: 'béo', label: t.ai_shape_full, sub: lang === 'vi' ? 'Tròn trịa, phúc hậu' : 'Plump, genial', icon: 'fa-heart' },
                      ].map((shape) => (
                        <button
                          key={shape.key}
                          type="button"
                          onClick={() => setBodyShape(shape.key as 'gầy' | 'bình thường' | 'béo')}
                          className={`p-3 text-center rounded-xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            bodyShape === shape.key
                              ? 'border-[#8B1E1E] bg-[#8B1E1E]/10 font-bold text-[#8B1E1E] shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-[#D97706]'
                          }`}
                        >
                          <i className={`fa-solid ${shape.icon} text-lg ${bodyShape === shape.key ? 'text-[#D97706]' : 'text-slate-400'}`}></i>
                          <span className="text-xs font-bold">{shape.label}</span>
                          <span className="text-[10px] text-slate-500 leading-tight">{shape.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3.2 Bối cảnh di sản & Tỷ lệ ảnh */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t.ai_background_label}
                      </label>
                      <select
                        value={backgroundSetting}
                        onChange={(e) => setBackgroundSetting(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-[#8B1E1E] cursor-pointer"
                      >
                        <option value="Phố cổ Hội An đèn lồng hoa đăng rực rỡ">{lang === 'vi' ? '🏮 Phố cổ Hội An đèn lồng hoa đăng' : '🏮 Hoi An Ancient Town lantern glow'}</option>
                        <option value="Cung đình Hoàng Thành Huế cổ kính uy nghi">{lang === 'vi' ? '🏯 Cung đình Hoàng Thành Huế cổ kính' : '🏯 Imperial Citadel of Hue'}</option>
                        <option value="Hồ Gươm sớm mai sương giăng tháp Rùa và hoa sen">{lang === 'vi' ? '🌸 Hồ Gươm sớm mai sương giăng & hoa sen' : '🌸 Hanoi Hoan Kiem Lake & lotus'}</option>
                        <option value="Ruộng bậc thang Sa Pa mây mù Tây Bắc">{lang === 'vi' ? '🌾 Ruộng bậc thang Sa Pa mây mù' : '🌾 Sa Pa misty terraced rice fields'}</option>
                        <option value="Miệt vườn sông nước miền Tây Nam Bộ thanh bình">{lang === 'vi' ? '🛶 Miệt vườn sông nước Nam Bộ' : '🛶 Mekong Delta peaceful river garden'}</option>
                        <option value="Studio hoàng gia ánh sáng nghệ thuật cổ điển">{lang === 'vi' ? '🎨 Studio hoàng gia ánh sáng nghệ thuật' : '🎨 Royal studio classic fine art'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t.ai_aspect_label}
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['3:4', '1:1', '9:16'] as const).map((ratio) => (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setTryOnAspectRatio(ratio)}
                            className={`py-2 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              tryOnAspectRatio === ratio
                                ? 'border-[#8B1E1E] bg-[#8B1E1E] text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3.3 Yêu cầu câu lệnh phong cách thêm (Prompt Note - Mở rộng sáng tạo) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>{t.ai_custom_note_label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{lang === 'vi' ? 'Hỗ trợ câu lệnh tự nhiên' : 'Natural language prompt'}</span>
                    </label>
                    <input
                      type="text"
                      value={customStylingNote}
                      onChange={(e) => setCustomStylingNote(e.target.value)}
                      placeholder={t.ai_custom_note_placeholder}
                      className="w-full p-2.5 bg-[#FDFBF7] border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-[#8B1E1E] focus:outline-none"
                    />

                    {/* Quick Suggestion Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        lang === 'vi' ? 'Cầm đóa sen hồng' : 'Holding a pink lotus',
                        lang === 'vi' ? 'Nón quai thao quai lụa' : 'Palm hat with silk ribbon',
                        lang === 'vi' ? 'Đội khăn xếp ngũ sắc' : 'Wearing five-color turban',
                        lang === 'vi' ? 'Nụ cười đoan trang rạng rỡ' : 'Graceful dignified smile',
                        lang === 'vi' ? 'Tóc vấn cài trâm bạc' : 'Hair coiled with silver hairpin',
                        lang === 'vi' ? 'Phong cách tranh hoài cổ' : 'Nostalgic vintage painting',
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            setCustomStylingNote((prev) => (prev ? `${prev}, ${chip}` : chip));
                          }}
                          className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 hover:bg-[#D97706]/15 hover:text-[#8B1E1E] text-slate-600 transition-colors cursor-pointer border border-slate-200"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* GEMINI MULTIMODAL API INTEGRATION PANEL */}
                <div className="bg-[#FAF6EE] p-4 rounded-2xl border-2 border-[#D97706]/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#8B1E1E]">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <i className="fa-solid fa-wand-magic-sparkles text-[#D97706]"></i>
                      <span>Google Gemini Multimodal API</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <i className="fa-solid fa-circle-check text-[10px]"></i>
                      {lang === 'vi' ? 'Trực Tuyến & Sẵn Sàng' : 'Online & Ready'}
                    </span>
                  </div>

                  {/* Thông số đầu vào gửi vào mô hình Gemini */}
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/70 text-xs space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {lang === 'vi' ? 'Thông số tổng hợp đa phương thức (Multimodal Inputs):' : 'Multimodal Synthesis Inputs:'}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500">{lang === 'vi' ? '1. Mặt:' : '1. Face:'}</span>
                        <strong className="text-slate-800 truncate">
                          {userFaceBase64
                            ? (lang === 'vi' ? 'Ảnh tải lên của bạn' : 'Your uploaded portrait')
                            : (aiSelectedCostume.gender === 'female'
                              ? (lang === 'vi' ? 'Mặt Nữ mặc định' : 'Default female face')
                              : (lang === 'vi' ? 'Mặt Nam mặc định' : 'Default male face'))}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500">{lang === 'vi' ? '2. Phục trang:' : '2. Costume:'}</span>
                        <strong className="text-slate-800 truncate">
                          {getLocalizedCostume(aiSelectedCostume, lang).name}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500">{lang === 'vi' ? '3. Vóc dáng:' : '3. Body:'}</span>
                        <strong className="text-[#8B1E1E] uppercase">
                          {lang === 'vi'
                            ? `Dáng ${bodyShape}`
                            : `Build: ${bodyShape === 'gầy' ? 'Slender' : bodyShape === 'béo' ? 'Full-figured' : 'Standard'}`}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500">{lang === 'vi' ? '4. Bối cảnh:' : '4. Setting:'}</span>
                        <strong className="text-slate-800 truncate">
                          {lang === 'vi'
                            ? (backgroundSetting.includes('Hội An') ? 'Hội An đèn lồng' : backgroundSetting.includes('Huế') ? 'Cung đình Huế' : backgroundSetting.includes('Hồ Gươm') ? 'Hồ Gươm hoa sen' : backgroundSetting.includes('Sa Pa') ? 'Sa Pa mây mù' : backgroundSetting.includes('sông nước') || backgroundSetting.includes('Nam Bộ') ? 'Sông nước Nam Bộ' : 'Studio hoàng gia')
                            : (backgroundSetting.includes('Hội An') ? 'Hoi An Lanterns' : backgroundSetting.includes('Huế') ? 'Hue Citadel' : backgroundSetting.includes('Hồ Gươm') ? 'Sword Lake Lotus' : backgroundSetting.includes('Sa Pa') ? 'Sa Pa Terraces' : backgroundSetting.includes('sông nước') || backgroundSetting.includes('Nam Bộ') ? 'Mekong Riverlands' : 'Royal Studio')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                    <span>{lang === 'vi' ? 'Mô hình kết xuất:' : 'Rendering model:'} <strong className="text-slate-800">gemini-3.1-flash-image</strong></span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <i className="fa-solid fa-shield-halved text-emerald-600"></i>
                      {lang === 'vi' ? 'Bảo mật qua Server Proxy' : 'Secured via Server Proxy'}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTON: TẠO ẢNH BẰNG GEMINI API */}
                <div className="pt-1 space-y-2">
                  <button
                    type="button"
                    disabled={isGeneratingAI}
                    onClick={handleGenerateAITryOn}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D97706] via-amber-600 to-[#8B1E1E] hover:from-[#c26a05] hover:to-[#731818] text-white font-extrabold text-sm sm:text-base tracking-wide uppercase shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className={`fa-solid fa-wand-magic-sparkles text-amber-200 ${isGeneratingAI ? 'animate-spin' : 'animate-pulse'}`}></i>
                    <span>{isGeneratingAI ? t.ai_btn_generating : t.ai_btn_generate}</span>
                  </button>

                  {isGeneratingAI && (
                    <div className="p-3 bg-[#FAF6EE] rounded-xl border border-amber-300 text-xs text-slate-700 animate-fadeIn space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-[#8B1E1E]">
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-spinner fa-spin text-[#D97706]"></i>
                          {lang === 'vi' ? 'Tiến trình xử lý Gemini AI:' : 'Gemini AI Process:'}
                        </span>
                        <span className="text-[10px] text-slate-500">{lang === 'vi' ? 'Đang thực thi...' : 'Processing...'}</span>
                      </div>
                      <p className="text-xs text-slate-600 italic">
                        {aiLoadingStep || (lang === 'vi' ? 'Đang xử lý hình ảnh qua mô hình Google Gemini...' : 'Synthesizing artwork with Google Gemini...')}
                      </p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#D97706] to-[#8B1E1E] h-full rounded-full animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 text-center">
                    {lang === 'vi'
                      ? 'Mô hình Google Gemini Multimodal kết hợp nhận diện thị giác khuôn mặt và tái hiện hoa văn trang phục truyền thống 8K.'
                      : 'Google Gemini Multimodal model integrates facial vision recognition and restores heritage garment patterns in 8K.'}
                  </p>
                </div>
              </div>

              {/* Right Column: Tác Phẩm AI Thành Phẩm & Showcase */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl p-6 border-2 border-[#D97706]/40 shadow-xl overflow-hidden relative">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-serif font-bold text-lg text-[#8B1E1E] flex items-center gap-2">
                      <i className="fa-solid fa-palette text-[#D97706]"></i>
                      <span>{t.ai_result_title}</span>
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowComparison(!showComparison)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                          showComparison
                            ? 'bg-[#8B1E1E] text-white border-[#8B1E1E]'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <i className="fa-solid fa-columns mr-1"></i> {t.ai_compare_btn}
                      </button>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 transition-all ${
                          isGeneratingAI
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : hasGeneratedResult
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isGeneratingAI ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin text-[10px]"></i>
                            <span>{lang === 'vi' ? 'Đang tạo ảnh...' : 'Generating...'}</span>
                          </>
                        ) : hasGeneratedResult ? (
                          <>
                            <i className="fa-solid fa-circle-check text-[10px] text-emerald-600"></i>
                            <span>{t.ai_finished_badge}</span>
                          </>
                        ) : (
                          <span>{lang === 'vi' ? 'Bản mẫu trang phục' : 'Costume sample'}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Main Result Display with Optional Side-by-Side Comparison */}
                  {showComparison ? (
                    <div className={`grid grid-cols-2 gap-2 w-full mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-[#D97706]/40 p-2 shadow-md ${
                      tryOnAspectRatio === '1:1'
                        ? 'aspect-[2/1] max-w-[480px] max-h-[44vh]'
                        : tryOnAspectRatio === '9:16'
                        ? 'aspect-[9/8] max-w-[400px] max-h-[56vh]'
                        : 'aspect-[3/2] max-w-[450px] max-h-[48vh] sm:max-h-[450px]'
                    }`}>
                      <div 
                        onClick={() => handleOpenCurrentDetail()}
                        className="flex flex-col items-center justify-center rounded-xl overflow-hidden bg-slate-900 relative cursor-pointer group/comp transition-transform hover:scale-[1.01]"
                        title={lang === 'vi' ? 'Bấm vào để xem chi tiết khuôn mặt và tác phẩm' : 'Click to view details'}
                      >
                        <img
                          src={userFaceBase64 || (aiGender === 'female' ? DEFAULT_FEMALE_FACE : DEFAULT_MALE_FACE)}
                          alt={t.ai_original_face}
                          className={`w-full h-full p-1 select-none transition-all duration-300 ${
                            imageFitMode === 'contain' ? 'object-contain' : 'object-cover'
                          }`}
                        />
                        <span className="absolute bottom-1.5 inset-x-1.5 bg-black/75 backdrop-blur-xs text-white text-[10px] text-center py-0.5 rounded font-bold">
                          {t.ai_original_face}
                        </span>
                      </div>
                      <div 
                        onClick={() => handleOpenCurrentDetail()}
                        className="flex flex-col items-center justify-center rounded-xl overflow-hidden bg-slate-900 relative cursor-pointer group/comp transition-transform hover:scale-[1.01]"
                        title={lang === 'vi' ? 'Bấm vào để xem chi tiết phục trang & ảnh' : 'Click to view costume details'}
                      >
                        <img
                          key={aiOutputImage}
                          src={aiOutputImage}
                          alt={aiSelectedCostume.name}
                          className={`w-full h-full p-1 select-none transition-all duration-300 ${
                            imageFitMode === 'contain' ? 'object-contain' : 'object-cover'
                          }`}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src !== aiSelectedCostume.imageUrl) {
                              target.src = aiSelectedCostume.imageUrl;
                            }
                          }}
                        />
                        <span className="absolute bottom-1.5 inset-x-1.5 bg-[#8B1E1E]/90 backdrop-blur-xs text-white text-[10px] text-center py-0.5 rounded font-bold">
                          {hasGeneratedResult ? (lang === 'vi' ? 'Việt phục AI đã thử' : 'AI Try-on Result') : (lang === 'vi' ? 'Mẫu trang phục' : 'Sample Costume')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleOpenCurrentDetail()}
                      className={`w-full mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-[#D97706]/40 flex items-center justify-center relative group shadow-md cursor-pointer transition-all ${
                        tryOnAspectRatio === '1:1'
                          ? 'aspect-square max-w-[340px] sm:max-w-[380px] max-h-[50vh] sm:max-h-[460px]'
                          : tryOnAspectRatio === '9:16'
                          ? 'aspect-[9/16] max-w-[280px] sm:max-w-[320px] max-h-[60vh] sm:max-h-[520px]'
                          : 'aspect-[3/4] max-w-[340px] sm:max-w-[380px] max-h-[54vh] sm:max-h-[480px]'
                      }`}
                      title={lang === 'vi' ? 'Nhấn vào hình để xem chi tiết tác phẩm & tư liệu' : 'Click image to view artwork & archive details'}
                    >
                      {isGeneratingAI && (
                        <div 
                          className="absolute inset-0 bg-[#1E293B]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white p-6 text-center space-y-4 animate-fadeIn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-14 h-14 border-4 border-[#D97706] border-t-transparent rounded-full animate-spin"></div>
                          <div className="space-y-1">
                            <h4 className="font-serif text-lg font-bold text-[#FDE68A]">
                              {lang === 'vi' ? 'AI Đang Tạo Tác Hình Ảnh...' : 'AI Synthesizing Portrait...'}
                            </h4>
                            <p className="text-xs text-slate-300 max-w-xs">{aiLoadingStep}</p>
                          </div>
                        </div>
                      )}

                      {/* Try-on Finished Image Display - Fully adaptive to devices & aspect ratios */}
                      <img
                        key={aiOutputImage}
                        src={aiOutputImage}
                        alt={`Kết quả thử đồ ${aiSelectedCostume.name}`}
                        className={`w-full h-full p-1 sm:p-2 transition-all duration-300 select-none group-hover:scale-[1.01] ${
                          imageFitMode === 'contain' ? 'object-contain' : 'object-cover'
                        }`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== aiSelectedCostume.imageUrl) {
                            target.src = aiSelectedCostume.imageUrl;
                          }
                        }}
                      />

                      {/* Hover Overlay Hint: Click to View Detail */}
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none z-10">
                        <span className="bg-black/80 text-white text-[11px] px-3.5 py-1.5 rounded-full backdrop-blur-md font-semibold flex items-center gap-1.5 shadow-xl border border-white/20">
                          <i className="fa-solid fa-magnifying-glass-plus text-amber-300"></i>
                          <span>{lang === 'vi' ? 'Nhấn để xem chi tiết' : 'Click to view details'}</span>
                        </span>
                      </div>

                      {/* Result Badge */}
                      {hasGeneratedResult && (
                        <div className="absolute top-2.5 left-2.5 bg-[#8B1E1E]/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 z-10 backdrop-blur-xs border border-amber-300/40 animate-fadeIn pointer-events-none">
                          <i className="fa-solid fa-sparkles text-amber-300"></i>
                          <span>{t.ai_finished_badge}</span>
                        </div>
                      )}

                      {/* Controls Overlay: Fit Toggle & Download */}
                      <div 
                        className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setImageFitMode(prev => prev === 'contain' ? 'cover' : 'contain')}
                          className="px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-semibold backdrop-blur-md transition-all cursor-pointer shadow-md flex items-center gap-1.5 border border-white/10"
                          title={imageFitMode === 'contain' ? (lang === 'vi' ? 'Chuyển sang chế độ tràn khung' : 'Switch to cover') : (lang === 'vi' ? 'Chuyển sang chế độ xem vừa vặn (toàn bộ ảnh)' : 'Switch to fit entire')}
                        >
                          <i className={`fa-solid ${imageFitMode === 'contain' ? 'fa-expand' : 'fa-compress'} text-amber-300`}></i>
                          <span>{imageFitMode === 'contain' ? t.ai_fit_full : t.ai_fit_cover}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadImage(aiOutputImage, `VietPhuc_${aiSelectedCostume.id}_${Date.now()}`)}
                          title={lang === 'vi' ? 'Tải ảnh độ phân giải cao về máy' : 'Download HD image'}
                          className="px-3 py-1.5 rounded-lg bg-[#8B1E1E] hover:bg-[#6e1818] text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-download"></i>
                          <span>{t.ai_btn_download}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Cultural Description & Synthesis Narrative */}
                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 bg-[#F4EFE6]/40 p-2.5 rounded-lg border border-[#D97706]/20">
                      <div className="flex items-center gap-2">
                        <span>{lang === 'vi' ? 'Trang phục:' : 'Costume:'} <strong className="text-slate-900">{getLocalizedCostume(aiSelectedCostume, lang).name}</strong></span>
                        <button
                          type="button"
                          onClick={() => handleOpenCurrentDetail()}
                          className="text-[#8B1E1E] hover:text-[#631313] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer bg-[#8B1E1E]/10 px-2 py-0.5 rounded-md transition-colors"
                          title={lang === 'vi' ? 'Nhấn để xem chi tiết trang phục' : 'View costume details'}
                        >
                          <i className="fa-solid fa-circle-info text-[11px]"></i>
                          <span>{lang === 'vi' ? 'Chi tiết' : 'Details'}</span>
                        </button>
                      </div>
                      <span>{lang === 'vi' ? 'Dáng:' : 'Silhouette:'} <strong className="text-[#8B1E1E] capitalize">{lang === 'vi' ? bodyShape : (bodyShape === 'gầy' ? 'Slender' : bodyShape === 'béo' ? 'Full-figured' : 'Standard')}</strong></span>
                    </div>
                    <div className="p-3 bg-[#FDFBF7] rounded-lg text-slate-700 text-[11px] leading-relaxed border border-slate-200">
                      <p className="font-semibold text-[#8B1E1E] mb-1">
                        <i className="fa-solid fa-feather mr-1.5 text-[#D97706]"></i>
                        {t.ai_narrative_title}
                      </p>
                      {aiNarrative}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* LỊCH SỬ THỬ ĐỒ & BỘ SƯU TẬP TÁC PHẨM CỦA BẠN             */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D97706]/30 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold tracking-widest text-[#8B1E1E] uppercase flex items-center gap-2">
                    <span className="w-4 h-0.5 bg-[#8B1E1E] inline-block"></span>
                    <span>{t.history_badge}</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1E293B] flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left text-[#D97706]"></i>
                    <span>{t.history_title}</span>
                    <span className="text-xs font-sans font-bold bg-[#8B1E1E]/10 text-[#8B1E1E] px-2.5 py-0.5 rounded-full ml-1">
                      {historyItems.length} {lang === 'vi' ? 'tác phẩm' : 'creations'}
                    </span>
                  </h3>
                </div>

                {historyItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryItems([]);
                      showToast(lang === 'vi' ? 'Đã xóa toàn bộ lịch sử thử đồ.' : 'Cleared all try-on history.');
                    }}
                    className="self-start sm:self-center text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-trash-can text-[11px]"></i>
                    <span>{t.history_clear_all}</span>
                  </button>
                )}
              </div>

              {historyItems.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-[#FDFBF7] border-2 border-dashed border-amber-200/80 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#D97706]/10 text-[#D97706] flex items-center justify-center mx-auto text-2xl">
                    <i className="fa-solid fa-camera-retro"></i>
                  </div>
                  <h4 className="font-serif font-bold text-base text-slate-800">
                    {t.history_empty_title}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    {t.history_empty_desc}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative bg-[#FDFBF7] rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Image Thumbnail */}
                      <div 
                        onClick={() => setSelectedHistoryItem(item)}
                        className="relative aspect-[3/4] bg-slate-900 overflow-hidden cursor-pointer"
                      >
                        <img
                          src={item.url}
                          alt={item.prompt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="p-2 rounded-full bg-white/90 text-slate-900 text-xs shadow-md">
                            <i className="fa-solid fa-magnifying-glass-plus"></i>
                          </span>
                        </div>
                        <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {item.timestamp}
                        </span>
                      </div>

                      {/* Info & Action Buttons */}
                      <div className="p-2.5 space-y-2 flex-1 flex flex-col justify-between">
                        <p className="text-[11px] font-bold text-slate-800 line-clamp-1" title={item.prompt}>
                          {item.prompt.split('•')[0] || item.prompt}
                        </p>

                        <div className="flex items-center gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAiOutputImage(item.url);
                              setHasGeneratedResult(true);
                              showToast(lang === 'vi' ? 'Đã nạp lại tác phẩm vào khung xem chính!' : 'Loaded creation back to studio!');
                            }}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-[#8B1E1E]/10 hover:bg-[#8B1E1E] text-[#8B1E1E] hover:text-white text-[10px] font-bold transition-colors text-center cursor-pointer"
                            title={lang === 'vi' ? 'Hiển thị lại ảnh này ở khung xem chính' : 'Display this in main view'}
                          >
                            {t.history_revisit}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadImage(item.url, `VietPhuc_${item.id}`)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] transition-colors cursor-pointer w-7 h-7 flex items-center justify-center"
                            title={lang === 'vi' ? 'Tải ảnh về máy' : 'Download image'}
                          >
                            <i className="fa-solid fa-download"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setHistoryItems(prev => prev.filter(it => it.id !== item.id));
                              showToast(lang === 'vi' ? 'Đã xóa tác phẩm khỏi lịch sử.' : 'Removed creation from history.');
                            }}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 text-[10px] transition-colors cursor-pointer w-7 h-7 flex items-center justify-center"
                            title={lang === 'vi' ? 'Xóa ảnh này' : 'Delete'}
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. COSTUME DETAIL MODAL                                   */}
      {/* ========================================================= */}
      {selectedCostumeForModal && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#D97706]/40 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setSelectedCostumeForModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/10 hover:bg-[#8B1E1E] hover:text-white flex items-center justify-center text-slate-700 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            {(() => {
              const modalLoc = getLocalizedCostume(selectedCostumeForModal, lang);
              return (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-5 rounded-2xl overflow-hidden shadow-md aspect-[3/4] bg-slate-100">
                      <CostumeImage
                        key={`${selectedCostumeForModal.fileName}_${forceRefreshKey}`}
                        src={selectedCostumeForModal.fileName}
                        fileName={selectedCostumeForModal.fileName}
                        alt={modalLoc.name}
                        name={modalLoc.name}
                        ethnicity={modalLoc.ethnicity}
                        accentColor={selectedCostumeForModal.accentColor}
                        className="w-full h-full object-cover"
                        onImageUploaded={() => {
                          setForceRefreshKey((k) => k + 1);
                          getAllImagesFromStore().then((imgs) =>
                            setLoadedImagesCount(Object.keys(imgs).length)
                          );
                        }}
                      />
                    </div>

                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                              selectedCostumeForModal.gender === 'female'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {selectedCostumeForModal.gender === 'female' ? t.modal_gender_female : t.modal_gender_male}
                          </span>
                          <span className="text-xs font-semibold text-[#D97706]">
                            {modalLoc.group}
                          </span>
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#8B1E1E]">
                          {modalLoc.name}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {t.modal_community} <strong>{modalLoc.ethnicity}</strong>
                        </p>
                      </div>

                      <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-[#F4EFE6]/40 p-4 rounded-xl border border-[#D97706]/20">
                        <div>
                          <strong className="text-[#1E293B] block font-bold text-[11px] uppercase tracking-wider mb-0.5">
                            {t.modal_origin_meaning}
                          </strong>
                          <p>{modalLoc.meaning}</p>
                        </div>
                        <div>
                          <strong className="text-[#1E293B] block font-bold text-[11px] uppercase tracking-wider mb-0.5">
                            {t.modal_structure}
                          </strong>
                          <p>{modalLoc.structure}</p>
                        </div>
                        <div>
                          <strong className="text-[#1E293B] block font-bold text-[11px] uppercase tracking-wider mb-0.5">
                            {t.modal_events}
                          </strong>
                          <p>{modalLoc.events}</p>
                        </div>
                        <div>
                          <strong className="text-[#1E293B] block font-bold text-[11px] uppercase tracking-wider mb-0.5">
                            {t.modal_style}
                          </strong>
                          <p>{modalLoc.style}</p>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleTransferToAI(selectedCostumeForModal)}
                          className="flex-1 py-3 px-4 rounded-xl bg-[#8B1E1E] hover:bg-[#631313] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <i className="fa-solid fa-wand-magic-sparkles"></i> {t.modal_try_with_this}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3b. HISTORY ITEM DETAIL & DOWNLOAD MODAL                 */}
      {/* ========================================================= */}
      {selectedHistoryItem && (
        <div 
          className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-5"
          onClick={() => setSelectedHistoryItem(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col border-2 border-[#D97706]/40 shadow-2xl relative animate-scaleUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-[#FDFBF7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#8B1E1E]/10 text-[#8B1E1E] flex items-center justify-center">
                  <i className="fa-solid fa-clock-rotate-left text-sm"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {t.history_detail_title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <i className="fa-solid fa-tag text-[9px]"></i>
                      {selectedHistoryItem.mode === 'tryon' ? (lang === 'vi' ? 'Thử đồ AI' : 'AI Try-on') : selectedHistoryItem.mode === 'edit' ? (lang === 'vi' ? 'Chỉnh sửa AI' : 'AI Edit') : (lang === 'vi' ? 'Tạo mới AI' : 'AI Create')}
                    </span>
                    <span>• {selectedHistoryItem.timestamp}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#8B1E1E] hover:text-white text-slate-600 flex items-center justify-center transition-all cursor-pointer"
                title={lang === 'vi' ? 'Đóng cửa sổ' : 'Close window'}
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Image Preview Box */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner flex items-center justify-center max-h-[58vh]">
                <img
                  src={selectedHistoryItem.url}
                  alt={selectedHistoryItem.prompt}
                  className="w-full h-auto max-h-[58vh] object-contain select-none"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadImage(selectedHistoryItem.url, `viet_phuc_${selectedHistoryItem.mode}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-black/75 hover:bg-[#8B1E1E] text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
                    title={lang === 'vi' ? 'Tải ảnh về máy' : 'Download image'}
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>{lang === 'vi' ? 'Tải về' : 'Download'}</span>
                  </button>
                </div>
              </div>

              {/* Information Cards */}
              <div className="bg-[#FDFBF7] rounded-2xl p-4 border border-[#D97706]/20 space-y-2">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-quote-left text-[#D97706]"></i>
                  <span>{lang === 'vi' ? 'Mô tả / Chi tiết trang phục' : 'Costume Details & Prompt'}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-serif italic">
                  "{selectedHistoryItem.prompt}"
                </p>
                {selectedHistoryItem.modelUsed && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{lang === 'vi' ? 'Mô hình kết xuất:' : 'Rendering model:'}</span>
                    <span className="font-mono text-[#8B1E1E] font-semibold">{selectedHistoryItem.modelUsed}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setAiOutputImage(selectedHistoryItem.url);
                  setAiNarrative(selectedHistoryItem.prompt);
                  setHasGeneratedResult(true);
                  setSelectedHistoryItem(null);
                  showToast(lang === 'vi' ? 'Đã đưa ảnh vào khung hiển thị chính!' : 'Loaded image into main studio!');
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <i className="fa-solid fa-eye text-[#D97706]"></i>
                <span>{lang === 'vi' ? 'Xem trên khung chính' : 'View in main studio'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedHistoryItem(null);
                  setSelectedCostumeForModal(aiSelectedCostume);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title={lang === 'vi' ? 'Xem tư liệu nguồn gốc, hoa văn và dịp lễ hội của trang phục này' : 'View historical records & archive'}
              >
                <i className="fa-solid fa-landmark text-amber-700"></i>
                <span>{lang === 'vi' ? 'Hồ sơ di sản' : 'Heritage Archive'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedHistoryItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  {t.modal_close}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadImage(selectedHistoryItem.url, `viet_phuc_${selectedHistoryItem.mode}`)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8B1E1E] to-[#B91C1C] hover:from-[#701515] hover:to-[#8B1E1E] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>{lang === 'vi' ? 'Tải xuống ảnh' : 'Download photo'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. INTRO POPUP MODAL (POPUP "i")                           */}
      {/* ========================================================= */}
      {introModalOpen && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-3xl max-w-xl w-full border-2 border-[#D97706] shadow-2xl overflow-hidden relative animate-scaleUp">
            <div className="bg-gradient-to-r from-[#631313] to-[#8B1E1E] p-6 text-white text-center relative">
              <div className="inline-block bg-[#FDFBF7] px-4 py-2 rounded-2xl border border-amber-300 shadow-md mx-auto mb-3">
                <img
                  src={customLogoUrl || BRAND_LOGO_URL}
                  alt="Việt phục"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>
              <h3 className="font-serif text-2xl font-bold">{t.intro_title}</h3>
              <p className="text-[#FDE68A] text-xs uppercase tracking-widest mt-1 font-semibold">
                {t.intro_subtitle}
              </p>

              {/* Language Selector Inside Intro Modal */}
              <div className="mt-3.5 inline-flex items-center p-0.5 bg-black/25 backdrop-blur-xs rounded-full border border-amber-300/40 text-xs">
                <button
                  type="button"
                  onClick={() => setLang('vi')}
                  className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    lang === 'vi' ? 'bg-[#FDFBF7] text-[#8B1E1E] shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span>🇻🇳</span> <span>Tiếng Việt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    lang === 'en' ? 'bg-[#FDFBF7] text-[#8B1E1E] shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span>🇬🇧</span> <span>English</span>
                </button>
              </div>

              <button
                onClick={handleCloseIntro}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-xl cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                <strong className="text-[#8B1E1E]">{t.site_title}</strong> {t.intro_desc}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#8B1E1E]/10 text-[#8B1E1E] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-compass"></i>
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs uppercase tracking-wide">
                      {t.intro_feat1_title}
                    </strong>
                    <span className="text-xs text-slate-600">
                      {t.intro_feat1_desc}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#D97706]/20 text-[#D97706] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs uppercase tracking-wide">
                      {t.intro_feat2_title}
                    </strong>
                    <span className="text-xs text-slate-600">
                      {t.intro_feat2_desc}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#0F766E]/20 text-[#0F766E] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-robot"></i>
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs uppercase tracking-wide">
                      {t.intro_feat3_title}
                    </strong>
                    <span className="text-xs text-slate-600">
                      {t.intro_feat3_desc}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D97706]/20 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dontShowIntroAgain}
                    onChange={(e) => setDontShowIntroAgain(e.target.checked)}
                    className="rounded text-[#8B1E1E] focus:ring-[#8B1E1E]"
                  />
                  <span>{t.intro_dont_show}</span>
                </label>
                <button
                  type="button"
                  onClick={handleCloseIntro}
                  className="px-5 py-2 rounded-xl bg-[#8B1E1E] hover:bg-[#631313] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {t.intro_start_btn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="bg-[#631313] text-white border-t-2 border-[#D97706]/50 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="bg-[#FDFBF7] px-3 py-1.5 rounded-xl shadow-xs flex items-center justify-center flex-shrink-0">
              <img
                src={customLogoUrl || BRAND_LOGO_URL}
                alt="Việt phục"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>
            <div>
              <p className="text-[12px] text-[#F4EFE6]/85 mt-0.5">
                {t.footer_tag}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#F4EFE6]/80 text-center sm:text-right font-medium">
            {t.footer_contest}
          </p>
        </div>
      </footer>

      {/* Dedicated Upload Modal (Chỉ kích hoạt khi admin truy cập trực tiếp có ?admin=true) */}
      {showUploadModal && typeof window !== 'undefined' && window.location.search.includes('admin=true') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FDFBF7] rounded-3xl max-w-lg w-full border border-[#D97706]/40 shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#8B1E1E]/10 text-[#8B1E1E] flex items-center justify-center mx-auto text-2xl">
                <i className="fa-solid fa-cloud-arrow-up text-[#D97706]"></i>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#8B1E1E]">
                Nạp Ảnh Phục Trang & Logo
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kéo thả các file ảnh từ máy tính vào đây (bao gồm 32 ảnh trang phục và ảnh logo <code>viet-phuc-xanh-reu.png</code>). Hệ thống sẽ tự động gán nguyên bản 100% dữ liệu gốc.
              </p>
            </div>

            {/* Khung Tải Riêng Cho Logo Thương Hiệu */}
            <div className="bg-[#FAF6EE] border border-[#D97706]/35 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-14 h-9 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                  <img src={customLogoUrl || BRAND_LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Ảnh Logo Thương Hiệu</h4>
                  <p className="text-[10px] text-slate-500">viet-phuc-xanh-reu.png</p>
                </div>
              </div>
              <label className="px-3 py-1.5 rounded-lg bg-[#1C3F34] hover:bg-[#142e26] text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs flex-shrink-0">
                <i className="fa-solid fa-upload text-[11px]"></i>
                <span>Tải Logo Lên</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                  }} 
                />
              </label>
            </div>

            {/* Dropzone */}
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) handleBatchFiles(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-[#D97706]/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#F4EFE6]/60 hover:bg-[#F4EFE6] transition-colors cursor-pointer group"
            >
              <i className="fa-solid fa-folder-open text-3xl text-[#D97706] mb-3 group-hover:scale-110 transition-transform"></i>
              <span className="text-sm font-bold text-slate-800">
                Nhấn để chọn tệp hoặc kéo thả ảnh vào đây
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Hỗ trợ định dạng JPG, JPEG, WEBP, PNG
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={isUploadingBatch}
                onChange={(e) => {
                  if (e.target.files) handleBatchFiles(e.target.files);
                }}
              />
            </label>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
              <span>Trạng thái hiện tại:</span>
              <strong className="text-[#8B1E1E]">{loadedImagesCount}/32 ảnh đã nạp</strong>
            </div>
          </div>
        </div>
      )}

      {/* Floating In-App Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-300">
          <div className="bg-[#631313] text-[#FDFBF7] border border-[#D97706] shadow-xl px-5 py-3 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium">
            <i className="fa-solid fa-circle-info text-[#FDE68A] text-base"></i>
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-amber-200 hover:text-white cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* 6. CHATBOT STYLIST POPUP WIDGET (BOTTOM RIGHT) */}
      <ChatbotWidget
        lang={lang}
        onSelectCostumeForAI={(costume) => {
          handleTransferToAI(costume);
        }}
        onViewCostumeDetail={(costume) => {
          setSelectedCostumeForModal(costume);
        }}
      />
    </div>
  );
}
