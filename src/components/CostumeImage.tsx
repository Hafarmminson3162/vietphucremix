import React, { useState, useEffect } from 'react';
import { getImageFromStore, saveImageToStore } from '../services/costumeImageStore';

interface CostumeImageProps {
  src: string;
  alt: string;
  className?: string;
  ethnicity?: string;
  name?: string;
  accentColor?: string;
  fileName?: string;
  allowEdit?: boolean;
  onImageUploaded?: (dataUrl: string) => void;
}

export const CostumeImage: React.FC<CostumeImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  ethnicity,
  name,
  accentColor = "#8B1E1E",
  fileName,
  allowEdit = false,
  onImageUploaded,
}) => {
  const [overrideSrc, setOverrideSrc] = useState<string | null>(null);
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasAllFailed, setHasAllFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check client-side store on mount or fileName/src change
  useEffect(() => {
    let isMounted = true;
    const lookupKey = fileName || src;
    if (lookupKey) {
      getImageFromStore(lookupKey).then((storedDataUrl) => {
        if (isMounted && storedDataUrl) {
          setOverrideSrc(storedDataUrl);
          setHasAllFailed(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [fileName, src]);

  const cleanSrc = (overrideSrc || src).trim();
  const isDataOrBlobUrl = cleanSrc.startsWith('data:') || cleanSrc.startsWith('blob:');
  const isHttpUrl = cleanSrc.startsWith('http://') || cleanSrc.startsWith('https://');
  const isRootPath = cleanSrc.startsWith('/');

  const candidates = isDataOrBlobUrl || isHttpUrl
    ? [cleanSrc]
    : isRootPath
    ? [cleanSrc, encodeURI(decodeURI(cleanSrc))]
    : [
        cleanSrc,
        encodeURI(cleanSrc),
        `/${cleanSrc.replace(/^\//, '')}`,
        encodeURI(`/${cleanSrc.replace(/^\//, '')}`),
        cleanSrc.replace(/^\//, ''),
        encodeURI(cleanSrc.replace(/^\//, '')),
        cleanSrc.endsWith('.jpg') ? cleanSrc.replace(/\.jpg$/, '.webp') : cleanSrc.replace(/\.webp$/, '.jpg'),
        encodeURI(cleanSrc.endsWith('.jpg') ? cleanSrc.replace(/\.jpg$/, '.webp') : cleanSrc.replace(/\.webp$/, '.jpg')),
      ];

  const uniqueCandidates = Array.from(new Set(candidates));

  useEffect(() => {
    setCurrentSrcIndex(0);
    setHasAllFailed(false);
    setIsLoaded(false);
  }, [src, overrideSrc]);

  const handleError = () => {
    if (currentSrcIndex < uniqueCandidates.length - 1) {
      setCurrentSrcIndex(prev => prev + 1);
    } else {
      setHasAllFailed(true);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setOverrideSrc(dataUrl);
          setHasAllFailed(false);
          setIsLoaded(true);
          const targetName = fileName || file.name;
          await saveImageToStore(targetName, dataUrl);
          if (onImageUploaded) {
            onImageUploaded(dataUrl);
          }
          // Also sync with server
          fetch('/api/upload-single', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: targetName, dataUrl }),
          }).catch(() => {});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F4EFE6] flex items-center justify-center group">
      {/* Background delicate dot pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
          backgroundSize: '16px 16px'
        }}
      />

      {!hasAllFailed ? (
        <>
          <img
            src={uniqueCandidates[currentSrcIndex]}
            alt={alt}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={handleError}
            className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-85'}`}
          />
          {/* Change image overlay only if explicitly allowed (locked when published) */}
          {allowEdit && (
            <label 
              title="Đổi ảnh cho bộ trang phục này"
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black text-[11px] flex items-center gap-1 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fa-solid fa-camera"></i>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleManualUpload} 
              />
            </label>
          )}
        </>
      ) : (
        /* Museum Heritage Exhibit Card (No edit/upload buttons for visitors) */
        <div 
          className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none"
          style={{
            background: `linear-gradient(145deg, #FBF9F5 0%, #F4EFE6 50%, #ECE4D8 100%)`
          }}
        >
          <div 
            className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-md mb-2 transition-transform hover:scale-105"
            style={{ backgroundColor: accentColor }}
          >
            <i className="fa-solid fa-vest-patches text-xl"></i>
          </div>
          <p className="font-serif font-bold text-xs sm:text-sm text-[#8B1E1E] line-clamp-1 max-w-[95%]">
            {name || alt}
          </p>
          <span className="text-[10px] text-amber-700 uppercase tracking-widest font-semibold mt-0.5">
            {ethnicity || "Di Sản Việt Phục"}
          </span>

          <div className="mt-2.5 px-2.5 py-1 rounded-full bg-[#8B1E1E]/10 text-[#8B1E1E] text-[10px] font-medium border border-[#8B1E1E]/20 flex items-center gap-1">
            <i className="fa-solid fa-landmark text-[9px]"></i>
            <span>Tư Liệu Cổ Truyền</span>
          </div>

          {allowEdit && (
            <label 
              onClick={(e) => e.stopPropagation()}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#8B1E1E] hover:bg-[#631313] text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-102"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>Nạp ảnh này</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleManualUpload} 
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
};
