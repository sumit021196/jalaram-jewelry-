"use client";

import { useState } from "react";
import { FALLBACK_IMG } from "@/utils/images";

interface AdminImageProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
}

export default function AdminImage({ src, alt, className }: AdminImageProps) {
    const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMG);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={() => setImgSrc(FALLBACK_IMG)}
        />
    );
}
