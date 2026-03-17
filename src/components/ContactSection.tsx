import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle } from "lucide-react";
import * as Icons from "lucide-react";
import { useContact, useSectionsSettings } from "@/hooks/useCms";
import EditableText from "@/components/cms/EditableText";
import SectionHeader from "@/components/SectionHeader";

const Icon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const LucideIcon = (Icons as any)[name] || Icons.Globe;
  return <LucideIcon className={className} style={style} />;
};

const ContactSection = () => {
  const contact = useContact();
  const sectionsSettings = useSectionsSettings();

  const contacts = [
    {
      icon: Phone,
      label: "Call 24/7",
      value: contact.phoneDisplay,
      href: contact.phone,
      accent: true,
    },
    {
      icon: Mail,
      label: "Email",
      value: contact.email || "info@xcellocksmith.com",
      href: `mailto:${contact.email || "info@xcellocksmith.com"}`,
      accent: false,
    },
    {
      icon: MessageCircle,
      label: "Text Us",
      value: contact.phoneDisplay,
      href: `sms:${contact.phone.replace('tel:', '')}`,
      accent: false,
    },
  ];

  return (
    <section id="contact" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader 
            heading={sectionsSettings.contact.heading}
            subheading={sectionsSettings.contact.subheading}
            sectionKey="contact"
            richHeading={sectionsSettings.contact.richHeading}
            richSubheading={sectionsSettings.contact.richSubheading}
          />
        </motion.div>

        {/* Contact methods */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 max-w-3xl mx-auto">
          {contacts.map(({ icon: Icon, label, value, href, accent }, i) => (
            <motion.a
              key={label}
              href={href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="neu-card rounded-2xl px-6 py-4 flex items-center gap-4 hover:scale-105 transition-transform cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent ? "skeu-cta-red group-hover:animate-pulse-glow-red" : "skeu-badge"}`}>
                <Icon className={`w-5 h-5 ${accent ? "text-white" : "text-accent"}`} />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className={`font-display font-bold ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Social links */}
        {sectionsSettings.contact.socialLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-sm text-muted-foreground font-medium">Follow us on social media:</span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {sectionsSettings.contact.socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Xcel Locksmith on ${social.platform}`}
                  className="p-3 neu-card rounded-xl text-muted-foreground hover:text-accent transition-colors hover:scale-110 duration-200 flex items-center gap-2"
                >
                  <Icon name={social.icon} className="w-5 h-5" style={{ color: social.color }} />
                  <span className="text-xs font-medium hidden sm:inline">
                    <EditableText
                      value={social.platform}
                      field={`contact.socialLinks.${i}.platform`}
                      fieldPath={`contact.socialLinks.${i}.platform`}
                      entityType="global"
                      entitySlug="sections-settings"
                      cacheKey={['cms', 'sections-settings']}
                    />
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
