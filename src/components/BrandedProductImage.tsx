import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

interface BrandedProductImageProps {
    src: string;
    alt: string;
    className?: string;
    badge?: string | null;
    category?: string;
}

export const BrandedProductImage: React.FC<BrandedProductImageProps> = ({
    src,
    alt,
    className = "",
    badge,
    category
}) => {
    // Check if we should overlay the branding
    // We overlay it for all honey products except the ones that are already master branded
    const isHoney = category === "honey";
    const isMasterBranded = src.includes("beeyield_honey");

    return (
        <div className={`relative overflow-hidden group ${className}`}>
            {/* Product Image */}
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                }}
            />

            {/* Glossy Overlay - Premium feel */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/5 opacity-30 pointer-events-none" />

            {/* Dynamic Shine Effect on Hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />

            {/* Brand Overlay / Tag */}
            {isHoney && (
                <div className="absolute top-3 right-3 flex flex-col items-end gap-2 pointer-events-none">
                    {/* Official BeeYield Logo Attachment (Visual representation of branding) */}
                    <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-green-200/50 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
                        <img src="/logo.png" alt="BeeYield Official" className="h-6 w-auto object-contain" />
                    </div>

                    {/* HoneyChain Traceability Stamp */}
                    <div className="bg-green-50 backdrop-blur-md px-2 py-1 rounded-full border border-green-200/50 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <ShieldCheck className="h-3 w-3 text-green-700" />
                        <span className="text-[8px] font-black uppercase tracking-tighter text-green-700">HoneyChain™ Secure</span>
                    </div>
                </div>
            )}

            {/* Badge Overlay */}
            {badge && (
                <Badge className="absolute top-3 left-3 bg-green-700/90 backdrop-blur-md text-white border-none text-[10px] font-bold px-3 py-1 shadow-md">
                    {badge}
                </Badge>
            )}

            {/* Honey Drip Decorative Icon (Bottom left) */}
            {isHoney && (
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 text-green-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.5c-3.1 0-5.5-2.4-5.5-5.5 0-2.4 2.1-5.1 4.3-7.5 0.5-0.5 1.4-0.5 1.9 0 2.2 2.4 4.3 5.1 4.3 7.5 0 3.1-2.4 5.5-5.5 5.5z" />
                    </svg>
                </div>
            )}
        </div>
    );
};
