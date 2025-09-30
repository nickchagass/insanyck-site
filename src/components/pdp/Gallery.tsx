"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import OptimizedImage from '@/components/ui/OptimizedImage';
import dynamic from 'next/dynamic';

// Import 3D component with SSR disabled
const Product3DView = dynamic(() => import('@/components/three/Product3DView'), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-white/5 rounded-2xl flex items-center justify-center" style={{ aspectRatio: "3 / 4" }}>
      <div className="text-white/60 text-sm animate-pulse">Carregando 3D...</div>
    </div>
  )
});

interface GalleryImage {
  url: string;
  alt: string;
  order?: number;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  images?: GalleryImage[];
  model3d?: { url: string };
}

interface GalleryProps {
  product: Product;
  className?: string;
}

export default function Gallery({ product, className = "" }: GalleryProps) {
  const { t } = useTranslation(['common', 'product']);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [can3D, setCan3D] = useState(false);
  const [has3DError, setHas3DError] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Prepare gallery images with hero image and additional images
  const galleryImages: GalleryImage[] = React.useMemo(() => {
    const images: GalleryImage[] = [];
    
    // Add hero image first
    if (product.image) {
      images.push({
        url: product.image,
        alt: `${product.title} - Imagem principal`,
        order: 0
      });
    }
    
    // Add additional images if they exist and are different from hero
    if (Array.isArray(product.images)) {
      product.images
        .filter(img => img && img.url && img.url !== product.image)
        .sort((a, b) => (a.order || 999) - (b.order || 999))
        .forEach((img, index) => {
          images.push({
            url: img.url,
            alt: img.alt || `${product.title} - Imagem ${index + 2}`,
            order: index + 1
          });
        });
    }
    
    // Fallback if no images
    if (images.length === 0) {
      images.push({
        url: "/products/placeholder/front.webp",
        alt: `${product.title} - Imagem do produto`,
        order: 0
      });
    }
    
    return images;
  }, [product]);

  const currentImage = galleryImages[currentImageIndex];
  const modelUrl = product?.model3d?.url;

  // Check for 3D capability
  useEffect(() => {
    if (typeof window === "undefined") return setCan3D(false);
    if (process.env.NEXT_PUBLIC_BACKEND_DISABLED === "1") return setCan3D(false);
    setCan3D(!!(window as any).WebGLRenderingContext);
  }, []);

  const show3D = can3D && !!modelUrl && !has3DError;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeLightbox();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateImage('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateImage('next');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentImageIndex, galleryImages.length]);

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    setCurrentImageIndex(prev => {
      if (direction === 'prev') {
        return prev > 0 ? prev - 1 : galleryImages.length - 1;
      } else {
        return prev < galleryImages.length - 1 ? prev + 1 : 0;
      }
    });
  }, [galleryImages.length]);

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    dialogRef.current?.showModal();
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    dialogRef.current?.close();
    document.body.style.overflow = '';
  }, []);

  const handleModelError = () => {
    console.error("3D model failed to load, falling back to image");
    setHas3DError(true);
  };

  return (
    <>
      {/* Main Gallery Container */}
      <div className={`card-insanyck p-4 ${className}`} ref={galleryRef}>
        {/* Main Image/3D View */}
        <div className="relative mb-4">
          <motion.div
            className="relative w-full bg-white/2 rounded-xl overflow-hidden cursor-zoom-in group"
            style={{ aspectRatio: "3 / 4" }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            onClick={() => openLightbox(currentImageIndex)}
            role="button"
            tabIndex={0}
            aria-label={t('product:gallery.expand', 'Ampliar imagem')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(currentImageIndex);
              }
            }}
          >
            {show3D ? (
              <div className="w-full h-full">
                <Product3DView modelUrl={modelUrl!} />
              </div>
            ) : (
              <OptimizedImage
                src={currentImage.url}
                alt={currentImage.alt}
                aspectRatio="3/4"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={currentImageIndex === 0}
                loading={currentImageIndex === 0 ? "eager" : "lazy"}
                fallbackSrc="/products/placeholder/front.webp"
              />
            )}
            
            {/* Zoom hint overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white/90 backdrop-blur-sm text-black px-3 py-1.5 rounded-lg text-sm font-medium">
                🔍 {t('product:gallery.clickToExpand', 'Clique para ampliar')}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Thumbnails */}
        {galleryImages.length > 1 && (
          <div className="pdp-thumbnails">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((image, index) => (
                <motion.button
                  key={index}
                  className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                    index === currentImageIndex
                      ? 'border-white/40 shadow-lg'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                  style={{ width: '80px', height: '100px' }}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`${t('product:gallery.selectImage', 'Selecionar imagem')} ${index + 1}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <OptimizedImage
                    src={image.url}
                    alt={image.alt}
                    aspectRatio="4/5"
                    sizes="80px"
                    className="object-cover"
                    loading="lazy"
                    fallbackSrc="/products/placeholder/front.webp"
                  />
                  {index === currentImageIndex && (
                    <div className="absolute inset-0 bg-white/10" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <dialog
            ref={dialogRef}
            className="fixed inset-0 z-50 w-full h-full bg-black/95 backdrop-blur-xl p-4 md:p-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeLightbox();
              }
            }}
          >
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                onClick={closeLightbox}
                aria-label={t('common:close', 'Fechar')}
              >
                ✕
              </button>

              {/* Image counter */}
              {galleryImages.length > 1 && (
                <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm">
                  {currentImageIndex + 1} / {galleryImages.length}
                </div>
              )}

              {/* Navigation arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    onClick={() => navigateImage('prev')}
                    aria-label={t('product:gallery.previousImage', 'Imagem anterior')}
                  >
                    ←
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    onClick={() => navigateImage('next')}
                    aria-label={t('product:gallery.nextImage', 'Próxima imagem')}
                  >
                    →
                  </button>
                </>
              )}

              {/* Main lightbox image */}
              <div className="max-w-4xl max-h-full w-full h-full flex items-center justify-center">
                <OptimizedImage
                  src={currentImage.url}
                  alt={currentImage.alt}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  sizes="100vw"
                  priority
                  loading="eager"
                  fallbackSrc="/products/placeholder/front.webp"
                />
              </div>
            </motion.div>
          </dialog>
        )}
      </AnimatePresence>
    </>
  );
}