import { motion } from "framer-motion";

const partners = [
  { 
    name: "Apisense", 
    url: "https://apisense.io", 
    logo: "/partners/apisense.png" 
  },
  { 
    name: "Intelligent Hives", 
    url: "https://intelligenthives.eu", 
    logo: "/partners/intelligenthives.png" 
  },
  { 
    name: "FarmersNow", 
    url: "https://farmersnow.com", 
    logo: "/partners/farmersnow.png" 
  }
];

export const PartnersMarquee = () => {
  // Duplicate array significantly for seamless ultra-wide looping
  const marqueeItems = [...partners, ...partners, ...partners, ...partners, ...partners, ...partners, ...partners, ...partners];

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-md border-y border-white/5 py-4 overflow-hidden relative z-10">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center">
        <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-[0.2em] font-mono mb-4 text-center">
          Building a Global Network of Partners
        </p>
        
        <div className="w-full relative overflow-hidden flex mask-edges">
          {/* Edge fades using absolute positioning */}
          <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-slate-900 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-slate-900 to-transparent z-20 pointer-events-none" />

          {/* Animated marquee row */}
          <motion.div
            className="flex items-center space-x-12 sm:space-x-20 whitespace-nowrap will-change-transform pl-4 pr-12"
            animate={{
              x: ["0%", "-50%"]
            }}
            transition={{
              duration: 35,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {marqueeItems.map((partner, idx) => (
              <a 
                key={`${partner.name}-${idx}`} 
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 group transition-all duration-300 opacity-60 hover:opacity-100 hover:scale-[1.02]"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 relative overflow-hidden rounded-md flex-shrink-0 bg-black/40 border border-white/10 group-hover:border-amber-400/50 transition-colors shadow-sm group-hover:shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  <img 
                    src={partner.logo} 
                    alt={`${partner.name} logo`} 
                    className="w-full h-full object-cover mix-blend-screen"
                    loading="lazy"
                  />
                </div>
                <span className="font-semibold text-sm md:text-base text-white tracking-wide">
                  {partner.name}
                </span>
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
