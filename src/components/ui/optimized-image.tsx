"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string | string[];
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  fallbackSrc?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
}

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill,
  priority,
  fallbackSrc = DEFAULT_FALLBACK,
  objectFit = "cover",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => {
    if (Array.isArray(src)) {
      return src.find((s) => s && s.trim()) || fallbackSrc;
    }
    return src || fallbackSrc;
  });

  const [srcIndex, setSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (Array.isArray(src) && srcIndex < src.length - 1) {
      // Try next image in array
      const nextIndex = srcIndex + 1;
      const nextSrc = src[nextIndex];
      if (nextSrc && nextSrc.trim()) {
        setSrcIndex(nextIndex);
        setCurrentSrc(nextSrc);
        return;
      }
    }

    // Fall back to default image
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }

    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400",
          fill ? "absolute inset-0" : "w-full h-full",
          className
        )}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        className={cn(
          `object-${objectFit} transition-opacity duration-300`,
          isLoading ? "opacity-0" : "opacity-100",
          fill ? "absolute inset-0" : "w-full h-full",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={currentSrc.includes("cloudinary.com")} // Skip Next.js optimization for Cloudinary
        sizes={
          width && height
            ? `${width}px`
            : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        }
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center",
            fill ? "" : "w-full h-full"
          )}
        >
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Get the best image URL from Cloudinary with proper transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!publicId) return DEFAULT_FALLBACK;

  const baseUrl = "https://res.cloudinary.com/dyi2puqmg/image/upload";
  const transformations = [];

  if (width && height) {
    transformations.push(`w_${width},h_${height},c_fill`);
  } else if (width) {
    transformations.push(`w_${width},c_scale`);
  }

  transformations.push(`q_${quality}`, "f_auto");

  const transformString = transformations.join(",");
  return `${baseUrl}/${transformString}/${publicId}`;
}

/**
 * PropertyImage component specifically for property images
 */
export function PropertyImage({
  images,
  alt,
  width,
  height,
  className,
  fill,
  priority,
}: {
  images: string[];
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}) {
  // Process images to ensure they're valid Cloudinary URLs
  const processedImages = images.filter(Boolean).map((img) => {
    if (img.includes("cloudinary.com")) {
      return img;
    }
    // If it's a public ID, convert to full Cloudinary URL
    if (img && !img.startsWith("http")) {
      return getCloudinaryUrl(img, width, height);
    }
    return img;
  });

  // For property cards, we want to use fill by default for better aspect ratio control
  const shouldUseFill = fill !== false;

  return (
    <OptimizedImage
      src={processedImages}
      alt={alt}
      width={shouldUseFill ? undefined : width}
      height={shouldUseFill ? undefined : height}
      fill={shouldUseFill}
      className={className}
      priority={priority}
      objectFit="cover"
    />
  );
}
