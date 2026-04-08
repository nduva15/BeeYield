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
  const marqueeItems = [...partners, ...partners, ...partners, ...partners, ...partners, ...partners];

  return (
    <section className="relative w-full overflow-hidden border-y border-border bg-muted/20 py-10 sm:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_55%)] pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Partners
          </span>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            Building a Global Network of Partners
          </h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            We collaborate with equipment innovators, research labs, and farming communities to protect pollinators and improve yields.
          </p>
        </div>

        <div className="w-full relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-12 md:w-28 bg-gradient-to-r from-muted/40 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 md:w-28 bg-gradient-to-l from-muted/40 to-transparent z-20 pointer-events-none" />

          <motion.div
            className="flex items-center gap-8 sm:gap-12 whitespace-nowrap will-change-transform py-2"
            animate={{
              x: ["0%", "-50%"]
            }}
            transition={{
              duration: 32,
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
                aria-label={`Visit ${partner.name}`}
                className="group inline-flex items-center gap-3 rounded-2xl border border-border bg-background/80 px-5 py-3 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="w-9 h-9 md:w-11 md:h-11 relative overflow-hidden rounded-xl flex-shrink-0 bg-primary/5 border border-primary/15 group-hover:border-primary/35 transition-colors">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="w-full h-full object-contain p-1.5 transition-all duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <span className="font-semibold text-sm md:text-base text-foreground">
                  {partner.name}
                </span>
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
