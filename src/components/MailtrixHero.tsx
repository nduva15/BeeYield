import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { type LucideIcon } from "lucide-react";

interface FloatingBadge {
    icon: LucideIcon | string;
    text: string;
}

interface MailtrixHeroProps {
    badge: string;
    title: string[];
    description: string;
    ctaText: string;
    ctaLink: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    onSecondaryClick?: () => void;
    floatingBadges: FloatingBadge[];
    centralImage?: string;
    variant: 'honey' | 'learn';
    stats?: { label: string; value: string }[];
}

const MailtrixHero = ({
    badge,
    title,
    description,
    ctaText,
    ctaLink,
    secondaryCtaText,
    secondaryCtaLink,
    onSecondaryClick,
    floatingBadges,
    centralImage,
    stats,
}: MailtrixHeroProps) => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1] as any,
            },
        },
    };

    const badgeVariants = (index: number) => {
        // Generate different directions for different badges
        const directions = [
            { x: -50, y: 0, rotate: -5 },   // left
            { x: 50, y: 0, rotate: 5 },    // right
            { x: 0, y: -50, rotate: -5 },  // top
            { x: 0, y: 50, rotate: 5 },   // bottom
        ];
        const dir = directions[index % directions.length];

        return {
            hidden: { opacity: 0, x: dir.x, y: dir.y, rotate: dir.rotate },
            visible: {
                opacity: 1,
                x: 0,
                y: 0,
                rotate: 0,
                transition: {
                    duration: 1.0,
                    delay: 2.5 + index * 0.4, // Increased delay and stagger
                    ease: [0.25, 0.1, 0.25, 1] as any,
                },
            },
        };
    };

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-20 overflow-hidden bg-white">
            {/* Background Micro-animations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#FF69B4]/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, delay: 2 }}
                    className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-beeyield-gold/10 rounded-full blur-[120px]"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center max-w-5xl mx-auto"
                >
                    {/* Top Badge */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <Badge className="bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-all border-none px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest">
                            {badge}
                        </Badge>
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-black text-neutral-900 leading-[0.9] tracking-tighter uppercase mb-8">
                        {title.map((line, i) => (
                            <motion.span
                                key={i}
                                className="block"
                                variants={itemVariants}
                            >
                                {line}
                            </motion.span>
                        ))}
                    </h1>

                    {/* Description */}
                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-neutral-500 mb-12 max-w-2xl leading-relaxed font-medium"
                    >
                        {description}
                    </motion.p>

                    {/* CTA Group */}
                    <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mb-20">
                        <Button
                            size="lg"
                            className="bg-neutral-900 hover:bg-neutral-800 text-white font-black rounded-2xl px-12 h-16 shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
                            onClick={() => navigate(ctaLink)}
                        >
                            {ctaText}
                        </Button>
                        {(secondaryCtaText && (secondaryCtaLink || onSecondaryClick)) && (
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-2 border-neutral-200 text-neutral-900 font-black rounded-2xl px-10 h-16 hover:bg-neutral-50 transition-all uppercase tracking-widest text-xs"
                                onClick={() => onSecondaryClick ? onSecondaryClick() : navigate(secondaryCtaLink!)}
                            >
                                {secondaryCtaText}
                            </Button>
                        )}
                    </motion.div>

                    {/* Impact Stats */}
                    {stats && (
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center gap-12 mb-16 border-t border-neutral-100 pt-8"
                        >
                            {stats.map((stat, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className="text-3xl font-black text-neutral-900 mb-1">{stat.value}</span>
                                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-400">{stat.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Central 3D Illustration Area */}
                    <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center">
                        {/* The "Box" Illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] as any }}
                            className="relative z-10 w-64 h-64 perspective-1000"
                        >
                            <div className="relative w-full h-full preserve-3d">
                                {/* 3D Box Skeleton */}
                                <div className="absolute inset-0 bg-white border-2 border-neutral-100 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                                    {centralImage ? (
                                        <img src={centralImage} alt="Feature" className="w-40 h-40 object-contain drop-shadow-xl" />
                                    ) : (
                                        <div className="w-32 h-32 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-center shadow-inner">
                                            <div className="w-16 h-16 bg-beeyield-gold/20 rounded-xl" />
                                        </div>
                                    )}
                                </div>

                                {/* 3D "Lid" Animation */}
                                <motion.div
                                    initial={{ rotateX: 0 }}
                                    animate={{ rotateX: -110 }}
                                    transition={{ duration: 1.2, delay: 1.8, ease: "easeOut" }}
                                    className="absolute -top-1 left-0 w-full h-full bg-white border-2 border-neutral-100 rounded-3xl origin-top shadow-md flex items-center justify-center z-20"
                                >
                                    {/* Inside Lid */}
                                    <div className="w-full h-full bg-gradient-to-b from-neutral-50 to-white rounded-3xl" />
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Floating Badges */}
                        {floatingBadges.map((badge, index) => {
                            // Position badges around the center
                            const angles = [210, 330, 45, 135, 270, 90];
                            const radius = 220; // Distance from center
                            const angle = (angles[index % angles.length] * Math.PI) / 180;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * (radius * 0.7); // Flatten the ellipse a bit

                            return (
                                <motion.div
                                    key={index}
                                    variants={badgeVariants(index)}
                                    initial="hidden"
                                    animate="visible"
                                    style={{ x, y }}
                                    className="absolute z-20"
                                >
                                    <div className="bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-neutral-100/50 flex items-center gap-3 whitespace-nowrap group hover:scale-110 hover:-translate-y-1 transition-all cursor-default">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-900 group-hover:bg-[#FF69B4]/10 group-hover:text-[#FF69B4] transition-colors">
                                            {typeof badge.icon === 'string' ? (
                                                <span className="text-lg">{badge.icon}</span>
                                            ) : (
                                                <badge.icon className="w-4 h-4" />
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-neutral-900 tracking-tight">
                                            {badge.text}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Bottom CTA Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 3, duration: 1 }}
                        className="mt-12 flex items-center gap-2 text-neutral-400 font-bold uppercase tracking-[0.2em] text-[10px]"
                    >
                        <span>Try our newest feature</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF69B4] animate-pulse" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Tailwind Perspective Utility */}
            <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
        </section>
    );
};

export default MailtrixHero;
