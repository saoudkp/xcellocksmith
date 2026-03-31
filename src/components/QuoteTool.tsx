import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Building2, Car, Send, CheckCircle, ChevronRight, Phone, MapPin, Loader2, Camera, X, ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBrand, useSectionsSettings } from "@/hooks/useCms";
import SectionHeader from "@/components/SectionHeader";

const CMS_URL = import.meta.env.VITE_CMS_URL || "http://localhost:3001";

type Step = 1 | 2 | 3 | 4;
type ServiceType = "residential" | "commercial" | "automotive";

const SERVICE_OPTIONS = [
  { type: "residential" as ServiceType, icon: Home, label: "Residential", desc: "Home lockouts, lock changes, rekeying" },
  { type: "commercial" as ServiceType, icon: Building2, label: "Commercial", desc: "Business locks, access control, master keys" },
  { type: "automotive" as ServiceType, icon: Car, label: "Automotive", desc: "Car lockouts, key replacement, ignition repair" },
];

const QuoteTool = () => {
  const { toast } = useToast();
  const brand = useBrand();
  const sectionsSettings = useSectionsSettings();
  const [step, setStep] = useState<Step>(1);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };
  const removePhoto = () => { setPhoto(null); if (photoPreview) URL.revokeObjectURL(photoPreview); setPhotoPreview(null); };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setGeoLoading(false); toast({ title: "Location captured", description: "GPS coordinates saved with your request." }); },
      () => setGeoLoading(false),
      { timeout: 8000 },
    );
  };

  const handleSubmit = async () => {
    if (honeypot) return;
    if (!name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (!phone.trim()) { toast({ title: "Phone required", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      let photoBase64: string | undefined;
      if (photo) {
        const reader = new FileReader();
        photoBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(photo);
        });
      }
      const payload: Record<string, unknown> = { name: name.trim(), phone: phone.trim(), serviceType: serviceType || undefined, location: location.trim() || undefined, body: body.trim() || undefined, honeypot };
      if (email.trim()) payload.email = email.trim();
      if (lat !== null) payload.lat = lat;
      if (lng !== null) payload.lng = lng;
      if (photoBase64) payload.photoBase64 = photoBase64;
      const res = await fetch(CMS_URL + "/api/submit-quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch { setSubmitted(true); } finally { setSubmitting(false); }
  };
  if (submitted) {
    return (
      <section id="quote" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto neu-card rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold mb-2">Quote Request Received!</h3>
            <p className="text-muted-foreground mb-6">Our team will call you within minutes to discuss your needs and provide an exact quote.</p>
            <a href={brand.phoneNumber} className="touch-target inline-flex items-center gap-2 skeu-button text-white font-bold px-6 py-3 rounded-xl"><Phone className="w-5 h-5" /> Can not Wait? Call Now</a>
          </div>
        </div>
      </section>
    );
  }

  const inputCls = "touch-target w-full neu-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none";

  return (
    <section id="quote" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <SectionHeader heading={sectionsSettings.quote.heading} subheading={sectionsSettings.quote.subheading} sectionKey="quote" richHeading={sectionsSettings.quote.richHeading} richSubheading={sectionsSettings.quote.richSubheading} />
        </motion.div>
        <div className="max-w-lg mx-auto neu-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (<div key={s} className={"h-2 flex-1 rounded-full transition-colors " + (s <= step ? "bg-accent" : "bg-border")} />))}
          </div>
          <input type="text" className="hidden" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="font-display text-xl font-bold mb-4">What type of service do you need?</h3>
                <div className="space-y-3">
                  {SERVICE_OPTIONS.map(opt => (
                    <button key={opt.type} onClick={() => { setServiceType(opt.type); setStep(2); }} className={"touch-target w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left " + (serviceType === opt.type ? "neu-card-pressed border-accent bg-accent/5" : "neu-card hover:bg-secondary")}>
                      <div className="w-10 h-10 rounded-lg skeu-badge flex items-center justify-center"><opt.icon className="w-5 h-5 text-accent" /></div>
                      <div className="flex-1"><p className="font-semibold text-foreground">{opt.label}</p><p className="text-sm text-muted-foreground">{opt.desc}</p></div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="font-display text-xl font-bold mb-1">Describe your issue</h3>
                <p className="text-sm text-muted-foreground mb-4">Tell us what is going on so we can come prepared.</p>
                <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="e.g. I am locked out of my house, the key broke in the lock..." rows={4} className={inputCls + " resize-none"} />
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">📷 Attach a photo (optional)</p>
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-border" />
                      <button onClick={removePhoto} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhotoSelect(e.target.files?.[0] || null)} />
                      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handlePhotoSelect(e.target.files?.[0] || null)} />
                      <button onClick={() => cameraInputRef.current?.click()} className="touch-target flex items-center gap-2 px-4 py-2.5 rounded-xl neu-card text-sm font-medium hover:bg-secondary transition-colors"><Camera className="w-4 h-4 text-accent" /> Take Photo</button>
                      <button onClick={() => fileInputRef.current?.click()} className="touch-target flex items-center gap-2 px-4 py-2.5 rounded-xl neu-card text-sm font-medium hover:bg-secondary transition-colors"><ImageIcon className="w-4 h-4 text-accent" /> Upload</button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="touch-target px-6 py-3 rounded-xl neu-card text-foreground font-medium hover:bg-secondary transition-colors">Back</button>
                  <button onClick={() => setStep(3)} className="touch-target flex-1 skeu-button text-white font-bold px-6 py-3 rounded-xl">Next</button>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="font-display text-xl font-bold mb-4">Where are you located?</h3>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Address or area in Cleveland" className={inputCls} />
                <button onClick={detectLocation} disabled={geoLoading} className="touch-target mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl neu-card text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50">
                  {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4 text-accent" />}
                  {lat ? 'GPS location captured' : 'Use my current location (GPS)'}
                </button>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="touch-target px-6 py-3 rounded-xl neu-card text-foreground font-medium hover:bg-secondary transition-colors">Back</button>
                  <button onClick={() => setStep(4)} className="touch-target flex-1 skeu-button text-white font-bold px-6 py-3 rounded-xl">Next</button>
                </div>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="font-display text-xl font-bold mb-4">Your contact info</h3>
                <div className="space-y-4">
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name *" className={inputCls} />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number *" className={inputCls} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address (optional)" className={inputCls} />
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(3)} className="touch-target px-6 py-3 rounded-xl neu-card text-foreground font-medium hover:bg-secondary transition-colors">Back</button>
                  <button onClick={handleSubmit} disabled={submitting} className="touch-target flex-1 flex items-center justify-center gap-2 skeu-cta-red text-white font-bold px-6 py-3 rounded-xl disabled:opacity-60">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {submitting ? 'Sending...' : 'Submit Quote Request'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default QuoteTool;