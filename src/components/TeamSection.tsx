import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Shield, Briefcase, Star, BadgeCheck, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, User } from "lucide-react";
import { useTeamMembers, useSectionsSettings } from "@/hooks/useCms";
import type { TeamMember, CertificationProof } from "@/data/team";
import SectionHeader from "@/components/SectionHeader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const BIO_LIMIT = 120;

const TeamMemberCard = ({
  member,
  index,
  onClick,
}: {
  member: TeamMember;
  index: number;
  onClick: () => void;
}) => {
  const needsTruncate = member.bio.length > BIO_LIMIT;
  const shortBio = needsTruncate
    ? member.bio.slice(0, BIO_LIMIT).replace(/\s+\S*$/, "") + "…"
    : member.bio;

  return (
    <motion.article
      key={member.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="neu-card rounded-2xl overflow-hidden group cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${member.name}'s full profile`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      itemScope
      itemType="https://schema.org/Person"
    >
      {/* Photo */}
      <div className="relative h-64 overflow-hidden">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={`${member.name} — ${member.role} at Xcel Locksmith Cleveland`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            itemProp="image"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <User className="w-20 h-20 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="skeu-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            <Briefcase className="w-3 h-3 text-accent" />
            <span className="text-accent">{member.experience}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-display text-lg font-bold" itemProp="name">{member.name}</h3>
        <p className="text-accent text-sm font-semibold mb-3" itemProp="jobTitle">{member.role}</p>
        <p className="text-muted-foreground text-sm leading-relaxed mb-1" itemProp="description">
          {shortBio}
        </p>
        {needsTruncate && (
          <span className="text-accent text-xs font-semibold hover:underline">
            Read more →
          </span>
        )}

        {/* Certifications preview */}
        <div className="mt-3 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Award className="w-3 h-3" /> Certifications
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {member.certifications.slice(0, 3).map((cert, ci) => (
              <span
                key={ci}
                className="text-[10px] px-2 py-1 rounded-full bg-accent/10 text-accent font-medium"
              >
                {cert.name}
              </span>
            ))}
            {member.certifications.length > 3 && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                +{member.certifications.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Specialties preview */}
        <div className="mt-3 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Star className="w-3 h-3" /> Specialties
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {member.specialties.map((spec, si) => (
              <span
                key={si}
                className="text-[10px] px-2 py-1 rounded-full neu-card-pressed font-medium text-foreground"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

/* ── Team Member Detail Popup ── */
const TeamMemberPopup = ({
  member,
  open,
  onOpenChange,
}: {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [certIndex, setCertIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!member) return null;

  const cert = member.certifications[certIndex];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setCertIndex(0); setZoomed(false); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-card border-border">
        <DialogTitle className="sr-only">{member.name} — Full Profile</DialogTitle>

        {/* Hero area with photo */}
        <div className="relative">
          {member.photoUrl ? (
            <div className="h-48 sm:h-64 overflow-hidden">
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-br from-accent/20 to-accent/5" />
          )}

          {/* Profile info overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
            <div className="flex items-end gap-4">
              {member.photoUrl && (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-20 h-20 rounded-full border-4 border-card object-cover shadow-lg"
                />
              )}
              <div className="pb-1">
                <h2 className="font-display text-xl font-bold text-foreground drop-shadow-sm">{member.name}</h2>
                <p className="text-accent text-sm font-semibold">{member.role}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-3 h-3 text-accent" />
                  <span className="text-xs text-muted-foreground font-medium">{member.experience}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Bio */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
          </div>

          {/* Specialties */}
          {member.specialties.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-accent" /> Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.specialties.map((spec, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications with images */}
          {member.certifications.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-accent" /> Certifications
              </h3>

              {/* Cert tabs */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {member.certifications.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => { setCertIndex(i); setZoomed(false); }}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                      i === certIndex
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Cert image/pdf viewer */}
              {cert && (
                <div className="relative bg-muted/30 rounded-xl overflow-hidden flex items-center justify-center min-h-[200px]">
                  {/* Nav arrows */}
                  {member.certifications.length > 1 && (
                    <>
                      <button
                        onClick={() => { setCertIndex((i) => (i - 1 + member.certifications.length) % member.certifications.length); setZoomed(false); }}
                        className="absolute left-2 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur hover:bg-card transition-colors border border-border"
                        aria-label="Previous certification"
                      >
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                      </button>
                      <button
                        onClick={() => { setCertIndex((i) => (i + 1) % member.certifications.length); setZoomed(false); }}
                        className="absolute right-2 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur hover:bg-card transition-colors border border-border"
                        aria-label="Next certification"
                      >
                        <ChevronRight className="w-4 h-4 text-foreground" />
                      </button>
                    </>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={certIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 w-full flex justify-center"
                    >
                      {cert.fileUrl ? (
                        cert.fileType === "pdf" ? (
                          <a
                            href={cert.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border hover:border-accent transition-colors"
                          >
                            <FileText className="w-12 h-12 text-accent" />
                            <span className="text-sm font-medium text-foreground">View PDF Document</span>
                          </a>
                        ) : (
                          <img
                            src={cert.fileUrl}
                            alt={`${cert.name} — ${member.name}`}
                            className={`max-w-full rounded-lg shadow-lg transition-transform duration-300 cursor-pointer ${
                              zoomed ? "scale-150 cursor-zoom-out" : "max-h-[300px] cursor-zoom-in"
                            }`}
                            onClick={() => setZoomed(!zoomed)}
                          />
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-6 text-muted-foreground">
                          <Shield className="w-10 h-10" />
                          <span className="text-sm">No document uploaded</span>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Zoom toggle */}
                  {cert.fileUrl && cert.fileType !== "pdf" && (
                    <button
                      onClick={() => setZoomed(!zoomed)}
                      className="absolute bottom-3 right-3 p-1.5 rounded-full bg-card/80 backdrop-blur border border-border hover:bg-card transition-colors"
                      aria-label={zoomed ? "Zoom out" : "Zoom in"}
                    >
                      {zoomed ? <ZoomOut className="w-3.5 h-3.5 text-foreground" /> : <ZoomIn className="w-3.5 h-3.5 text-foreground" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ── Main Section ── */
const TeamSection = () => {
  const { members: team, isLoading } = useTeamMembers();
  const sectionsSettings = useSectionsSettings();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const openProfile = (member: TeamMember) => {
    setSelectedMember(member);
    setPopupOpen(true);
  };

  return (
    <section id="team" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <SectionHeader
            heading={sectionsSettings.team.heading}
            subheading={sectionsSettings.team.subheading}
            sectionKey="team"
            richHeading={sectionsSettings.team.richHeading}
            richSubheading={sectionsSettings.team.richSubheading}
          />
        </motion.div>

        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="neu-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-64 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid gap-8 justify-center ${
            team.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
            team.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' :
            team.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            {team.map((member, i) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                index={i}
                onClick={() => openProfile(member)}
              />
            ))}
          </div>
        )}

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-wrap items-center justify-center gap-6"
        >
          {[
            { icon: Shield, text: "All Technicians Licensed & Insured" },
            { icon: Award, text: "ALOA Certified Professionals" },
            { icon: Star, text: "Background Checked & Vetted" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="skeu-badge flex items-center gap-2 rounded-full px-5 py-2.5">
              <Icon className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Team member detail popup */}
      <TeamMemberPopup
        member={selectedMember}
        open={popupOpen}
        onOpenChange={setPopupOpen}
      />
    </section>
  );
};

export default TeamSection;
