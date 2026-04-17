import { motion } from "framer-motion";

const partners = [
  {
    name: "Apisense",
    url: "https://apisense.ai/en",
    logo: "/partners/apisense.png",
  },
  {
    name: "Intelligent Hives",
    url: "https://intelligenthives.eu/",
    logo: "/partners/intelligenthives.png",
  },
  {
    name: "Farmers",
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, duration: 0.5, ease: "easeOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const PartnersMarquee = () => {
  return (
    <section className="relative w-full overflow-hidden border-y border-border/70 bg-gradient-to-b from-muted/40 via-muted/10 to-transparent py-12 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_55%)] pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center gap-3 mb-10 sm:mb-12">
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

        <motion.ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {partners.map((partner) => (
            <motion.li key={partner.name} variants={itemVariants}>
              {partner.url ? (
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${partner.name}`}
                  className="group flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-border/70 bg-background/80 px-6 py-8 text-center shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  {partner.logo ? (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 transition-colors group-hover:border-primary/35 md:h-16 md:w-16">
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <span className="text-base font-semibold tracking-tight text-foreground">
                    {partner.name}
                  </span>
                </a>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-border/70 bg-background/80 px-6 py-8 text-center shadow-sm backdrop-blur">
                  <span className="text-base font-semibold tracking-tight text-foreground">
                    {partner.name}
                  </span>
                </div>
              )}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};
