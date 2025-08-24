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

const DEFAULT_FALLBACK = ""; // No fallback - show placeholder instead

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

    // Show error placeholder when no fallback or fallback fails
    setHasError(true);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Show placeholder if no valid source or error occurred
  if (hasError || !currentSrc) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-gray-100 text-gray-400",
          fill ? "absolute inset-0" : "w-full h-full",
          className
        )}
      >
        <svg
          className="w-8 h-8 mb-2"
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
        <span className="text-xs font-medium">No Images</span>
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
        unoptimized={false} // Use Next.js optimization
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
 * Get the AWS S3/CloudFront URL for images
 */
export function getS3ImageUrl(
  imagePath: string,
  cloudFrontDomain?: string
): string {
  if (!imagePath) return DEFAULT_FALLBACK;

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Get CloudFront domain from environment or parameter
  const domain =
    cloudFrontDomain || process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN;

  if (domain) {
    return `https://${domain}/${imagePath}`;
  }

  // Fallback to the image path as is (assumes it's already a full URL)
  return imagePath;
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
  // Process images to ensure they're valid URLs
  const processedImages = images.filter(Boolean).map((img) => {
    if (img.includes("cloudfront.net") || img.startsWith("http")) {
      return img;
    }
    // If it's a relative path, convert to S3/CloudFront URL
    if (img && !img.startsWith("http")) {
      return getS3ImageUrl(img);
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
