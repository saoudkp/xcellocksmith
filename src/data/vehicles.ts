export interface VehicleMake {
  id: string;
  name: string;
  logoUrl: string; // Admin-uploadable via backend later
  models: VehicleModel[];
}

export interface VehicleModel {
  id: string;
  name: string;
  supportedServices: string[];
}

const allAutoServices = [
  "Car Lockout Services",
  "Car Key Replacement",
  "Transponder Key Programming",
  "Remote Key Fob Programming",
  "Ignition Repair & Replacement",
  "Ignition Key Cutting & Rebuilding",
  "Broken Key Extraction",
  "Key Decoding & VIN Key Generation",
  "Automotive Lock Rekeying",
];

/** Logo CDN base — uses car-logos-dataset from GitHub */
const logoBase = "https://www.carlogos.org/car-logos";

const BRAND_LOGOS: Record<string, string> = {
  Chevrolet: `${logoBase}/chevrolet-logo.png`,
  GMC: `${logoBase}/gmc-logo.png`,
  Cadillac: `${logoBase}/cadillac-logo.png`,
  Buick: `${logoBase}/buick-logo.png`,
  Ford: `${logoBase}/ford-logo.png`,
  Lincoln: `${logoBase}/lincoln-logo.png`,
  Chrysler: `${logoBase}/chrysler-logo.png`,
  Dodge: `${logoBase}/dodge-logo.png`,
  Jeep: `${logoBase}/jeep-logo.png`,
  Ram: `${logoBase}/ram-logo.png`,
};

const makeModels = (name: string, models: string[]): VehicleMake => ({
  id: name.toLowerCase().replace(/\s/g, "-"),
  name,
  logoUrl: BRAND_LOGOS[name] || "",
  models: models.map(m => ({
    id: `${name.toLowerCase()}-${m.toLowerCase().replace(/\s/g, "-")}`,
    name: m,
    supportedServices: allAutoServices,
  })),
});

export const vehicleMakes: VehicleMake[] = [
  makeModels("Chevrolet", ["Silverado", "Malibu", "Impala", "Cruze", "Equinox", "Tahoe", "Suburban", "Camaro", "Corvette"]),
  makeModels("GMC", ["Sierra", "Yukon", "Acadia", "Terrain", "Canyon"]),
  makeModels("Cadillac", ["Escalade", "CTS", "ATS", "XT4", "XT5", "XT6"]),
  makeModels("Buick", ["Encore", "Enclave", "LaCrosse", "Regal"]),
  makeModels("Ford", ["F-150", "Escape", "Explorer", "Fusion", "Mustang", "Ranger"]),
  makeModels("Lincoln", ["Navigator", "MKZ", "Corsair", "Aviator"]),
  makeModels("Chrysler", ["300", "Pacifica", "Voyager"]),
  makeModels("Dodge", ["Charger", "Challenger", "Durango", "Ram"]),
  makeModels("Jeep", ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade"]),
  makeModels("Ram", ["1500", "2500", "3500", "ProMaster"]),
];
