import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, CheckCircle, AlertCircle, KeyRound } from "lucide-react";
import { type VehicleMake, type VehicleModel } from "@/data/vehicles";
import { useVehicleMakes, useSectionsSettings } from "@/hooks/useCms";
import SectionHeader from "@/components/SectionHeader";

const VehicleVerifier = () => {
  const vehicleMakes = useVehicleMakes();
  const sectionsSettings = useSectionsSettings();
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);

  return (
    <section id="vehicle-verifier" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader 
            heading={sectionsSettings.vehicleVerifier.heading}
            subheading={sectionsSettings.vehicleVerifier.subheading}
            sectionKey="vehicleVerifier"
            richHeading={sectionsSettings.vehicleVerifier.richHeading}
            richSubheading={sectionsSettings.vehicleVerifier.richSubheading}
          />
        </motion.div>

        <div className="max-w-2xl mx-auto neu-card rounded-2xl p-8">
          {/* Make Selection with Logos */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <KeyRound className="w-5 h-5 text-accent" />
              Select Vehicle Make
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {vehicleMakes.map((make) => (
                <button
                  key={make.id}
                  onClick={() => { setSelectedMake(make); setSelectedModel(null); }}
                  className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-sm font-medium transition-all ${
                    selectedMake?.id === make.id
                      ? "neu-card-pressed text-accent"
                      : "neu-card hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center overflow-hidden p-1 shadow-sm">
                    {make.logoUrl ? (
                      <img
                        src={make.logoUrl}
                        alt={`${make.name} logo`}
                        className="w-12 h-12 object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          target.parentElement!.innerHTML = `<span class="font-display font-bold text-xl text-accent">${make.name.charAt(0)}</span>`;
                        }}
                      />
                    ) : (
                      <span className="font-display font-bold text-xl text-accent">
                        {make.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs leading-tight text-center">{make.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <AnimatePresence>
            {selectedMake && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Select {selectedMake.name} Model
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedMake.models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className={`touch-target px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedModel?.id === model.id
                          ? "skeu-button text-white"
                          : "neu-card hover:bg-secondary text-foreground"
                      }`}
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {selectedModel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card rounded-xl p-6 border border-accent/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  {selectedMake?.logoUrl ? (
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden p-1 shadow-sm">
                      <img
                        src={selectedMake.logoUrl}
                        alt={selectedMake.name}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          target.parentElement!.innerHTML = `<svg class="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
                        }}
                      />
                    </div>
                  ) : (
                    <Car className="w-6 h-6 text-accent" />
                  )}
                  <h3 className="font-display text-xl font-bold">
                    {selectedMake?.name} {selectedModel.name}
                  </h3>
                </div>
                {selectedModel.supportedServices.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">✅ Full service support available:</p>
                    {selectedModel.supportedServices.map((svc, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {svc}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p>Custom consultation needed. Call us for your specific vehicle requirements.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default VehicleVerifier;
