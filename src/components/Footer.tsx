import { Link as RouterLink } from "react-router-dom";
import { QuickLink as Link } from "./QuickLink";
import { Facebook, Instagram, Twitter, Linkedin, MessageSquare, ShieldCheck, Mail, MapPin, TabletIcon, Cpu, Leaf } from "lucide-react";
import Logo from "@/assets/Logo.png";
import { Newsletter } from "@/components/Newsletter";
import { Button } from "./ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Solutions",
      links: [
        { label: "Professional Pollination", href: "/crops-we-pollinate" },
        { label: "Precision Platform", href: "/precision-pollination" },
        { label: "Hive Connect", href: "/pollination-solutions" },
        { label: "Global Network", href: "/global-hive-network" }
      ]
    },
    {
      title: "The Bakery",
      links: [
        { label: "Honey Shop", href: "/shop" },
        { label: "Traceability", href: "/traceability" },
        { label: "Our Story", href: "/ourstory" },
        { label: "Commitment", href: "/commitment" }
      ]
    },
    {
      title: "Insights",
      links: [
        { label: "The BeeLearn", href: "/learn" },
        { label: "Media Gallery", href: "/media" },
        { label: "Industry Blog", href: "/blogs" },
        { label: "Impact Reports", href: "/impact" }
      ]
    }
  ];

  return (
    <footer className="bg-neutral-900 text-white relative overflow-hidden pt-24 pb-12">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-beeyield-gold via-beeyield-green to-beeyield-gold opacity-50" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-beeyield-green/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-[radial-gradient(circle_at_20%_80%,#10b981_0%,transparent_50%)] opacity-5 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-white/5 rounded-2xl border border-white/10 group-hover:border-beeyield-gold/50 transition-all duration-500 shadow-xl">
                <img
                  src={Logo}
                  alt="BeeYield logo"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic group-hover:text-beeyield-gold transition-colors">BeeYield</span>
            </Link>

            <p className="text-neutral-400 font-medium leading-relaxed max-w-sm">
              Advancing pollination through precision IoT and protecting the legacy of the African Honey Bee. Every drop is traceable, every harvest is shared.
            </p>

            <div className="flex items-center gap-4">
              {[
                { icon: Facebook, href: "https://facebook.com" },
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Linkedin, href: "https://www.linkedin.com/company/beeyield/" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-neutral-400 hover:text-beeyield-gold hover:border-beeyield-gold/50 hover:bg-white/10 transition-all duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Verified Badge */}
            <div className="pt-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                <ShieldCheck className="h-5 w-5 text-beeyield-gold" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Verified System Core v2.4</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section, i) => (
              <div key={i} className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-beeyield-gold">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        to={link.href}
                        className="text-sm font-bold text-neutral-400 hover:text-white transition-colors flex items-center group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-beeyield-green mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter & Contact */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-beeyield-gold/10 rounded-full blur-2xl group-hover:bg-beeyield-gold/20 transition-all" />

              <h3 className="text-lg font-black uppercase tracking-tighter mb-4">Stay Synchronized</h3>
              <p className="text-xs text-neutral-400 mb-6 font-medium leading-relaxed">
                Join our network for direct-to-farm reports and seasonal honey drop alerts.
              </p>
              <Newsletter className="dark" />
            </div>

            <ul className="space-y-4 px-2">
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-beeyield-green/10 flex items-center justify-center border border-beeyield-green/20">
                  <Mail className="h-4 w-4 text-beeyield-green" />
                </div>
                <span className="text-xs font-bold text-neutral-300">support@beeyield.com</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-beeyield-gold/10 flex items-center justify-center border border-beeyield-gold/20">
                  <MapPin className="h-4 w-4 text-beeyield-gold" />
                </div>
                <span className="text-xs font-bold text-neutral-300">Kibwezi, Makueni, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest text-neutral-500">
          <div className="flex items-center gap-8">
            <p>&copy; {currentYear} BeeYield Precision Pollination.</p>
            <div className="md:flex gap-6 hidden">
              <Link to="/privacy" className="hover:text-beeyield-gold transition-colors">Privacy Core</Link>
              <Link to="/terms" className="hover:text-beeyield-gold transition-colors">Service Protocol</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span>System Status: Optimal</span>
            </div>
            <span className="text-neutral-700">|</span>
            <span>Designed by Colony Digital</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
