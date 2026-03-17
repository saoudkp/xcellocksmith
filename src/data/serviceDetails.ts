/**
 * Extended service descriptions for SEO-rich detail dialogs.
 * Each entry maps to a service slug with long-form copy and unique images.
 */

// Residential images
import imgHouseLockout from "@/assets/services/house-lockout-services.jpg";
import imgLockInstallation from "@/assets/services/lock-installation-replacement.jpg";
import imgLockRepair from "@/assets/services/lock-repair.jpg";
import imgLockRekeying from "@/assets/services/lock-rekeying.jpg";
import imgKeyDuplication from "@/assets/services/key-duplication-spare-keys.jpg";
import imgHighSecurity from "@/assets/services/high-security-locks.jpg";
import imgSmartLock from "@/assets/services/smart-lock-installation.jpg";
import imgDeadbolt from "@/assets/services/deadbolt-installation-repair.jpg";
import imgMailboxGate from "@/assets/services/mailbox-gate-locks.jpg";
import imgMasterKeyRes from "@/assets/services/master-key-systems-residential.jpg";

// Commercial images
import imgCommLockout from "@/assets/services/commercial-lockout-services.jpg";
import imgBizLock from "@/assets/services/business-lock-installation-repair.jpg";
import imgCommRekey from "@/assets/services/commercial-rekeying.jpg";
import imgMasterKeyDesign from "@/assets/services/master-key-system-design.jpg";
import imgAccessControl from "@/assets/services/access-control-systems.jpg";
import imgHighSecComm from "@/assets/services/high-security-commercial-locks.jpg";
import imgStorefront from "@/assets/services/office-storefront-locks.jpg";
import imgPanicBar from "@/assets/services/panic-bars-exit-devices.jpg";
import imgFileCabinet from "@/assets/services/file-cabinet-desk-locks.jpg";
import imgKeyControl from "@/assets/services/key-control-restricted-keys.jpg";

// Automotive images
import imgCarLockout from "@/assets/services/car-lockout-services.jpg";
import imgCarKey from "@/assets/services/car-key-replacement.jpg";
import imgTransponder from "@/assets/services/transponder-key-programming.jpg";
import imgKeyFob from "@/assets/services/remote-key-fob-programming.jpg";
import imgIgnitionRepair from "@/assets/services/ignition-repair-replacement.jpg";
import imgIgnitionKey from "@/assets/services/ignition-key-cutting-rebuilding.jpg";
import imgBrokenKey from "@/assets/services/broken-key-extraction.jpg";
import imgVinKey from "@/assets/services/key-decoding-vin-key-generation.jpg";
import imgAutoRekey from "@/assets/services/automotive-lock-rekeying.jpg";

export interface ServiceDetail {
  slug: string;
  longDescription: string;
  benefits: string[];
  categoryImage: string;
  ctaText: string;
}

export const serviceDetails: Record<string, ServiceDetail> = {
  // Residential
  "house-lockout-services": {
    slug: "house-lockout-services",
    longDescription: "Getting locked out of your home is stressful, especially late at night or in bad weather. Our certified technicians arrive within 20–30 minutes with professional tools to open your door without damaging your locks, door frame, or finish. We serve all of Greater Cleveland 24/7/365 — no extra charge for nights, weekends, or holidays.",
    benefits: ["No damage to locks or doors", "20–30 minute response time", "No hidden fees — price quoted upfront", "Available 24/7 including holidays"],
    categoryImage: imgHouseLockout,
    ctaText: "Locked Out? Call Now for Immediate Help",
  },
  "lock-installation-replacement": {
    slug: "lock-installation-replacement",
    longDescription: "Whether you're upgrading an old lock or installing one on a brand-new door, our technicians recommend and install top-rated brands like Schlage, Kwikset, and Medeco. We match the right lock grade to your security needs and ensure perfect alignment for years of trouble-free use.",
    benefits: ["Top-brand locks installed", "Grade-1 and Grade-2 options", "Perfect fit guaranteed", "Free security assessment included"],
    categoryImage: imgLockInstallation,
    ctaText: "Upgrade Your Home Security Today",
  },
  "lock-repair": {
    slug: "lock-repair",
    longDescription: "Stuck, jammed, or broken locks are more than an inconvenience — they're a security risk. Our locksmiths diagnose and repair all lock types including deadbolts, mortise locks, and smart locks. We carry common parts on our service vehicles so most repairs are completed in a single visit.",
    benefits: ["Same-visit repairs", "All lock types serviced", "Parts carried on-board", "Warranty on all repairs"],
    categoryImage: imgLockRepair,
    ctaText: "Fix Your Broken Lock — Call Now",
  },
  "lock-rekeying": {
    slug: "lock-rekeying",
    longDescription: "Rekeying is the most cost-effective way to secure your home after moving in, losing a key, or ending a roommate arrangement. We change the internal pins so old keys no longer work, and provide you with fresh new keys — all without replacing the entire lock hardware.",
    benefits: ["Fraction of replacement cost", "Old keys instantly disabled", "Same-day service available", "Multiple locks rekeyed to one key"],
    categoryImage: imgLockRekeying,
    ctaText: "Rekey Your Locks for Peace of Mind",
  },
  "key-duplication-spare-keys": {
    slug: "key-duplication-spare-keys",
    longDescription: "Don't wait until you're locked out. Get spare keys cut with precision for every door in your home. We duplicate standard keys, high-security keys, and restricted keyway keys on-site using professional-grade machines.",
    benefits: ["Precision-cut duplicates", "High-security keys available", "On-site cutting", "Bulk discounts for multiple keys"],
    categoryImage: imgKeyDuplication,
    ctaText: "Get Spare Keys Cut Today",
  },
  "high-security-locks": {
    slug: "high-security-locks",
    longDescription: "Protect your home against picking, bumping, and drilling attacks with UL-listed high-security locks from Medeco, Mul-T-Lock, and ASSA ABLOY. These locks feature patented key control, hardened steel components, and pick-resistant pin systems.",
    benefits: ["Pick, bump & drill resistant", "Patented key control", "UL-listed hardware", "Insurance premium reduction"],
    categoryImage: imgHighSecurity,
    ctaText: "Upgrade to Maximum Security",
  },
  "smart-lock-installation": {
    slug: "smart-lock-installation",
    longDescription: "Go keyless with smart lock installation. We install and configure locks from August, Yale, Schlage Encode, and more. Control access from your phone, set auto-lock schedules, grant temporary guest codes, and integrate with Alexa or Google Home.",
    benefits: ["Keyless convenience", "Remote access & monitoring", "Temporary guest codes", "Smart home integration"],
    categoryImage: imgSmartLock,
    ctaText: "Go Keyless — Schedule Installation",
  },
  "deadbolt-installation-repair": {
    slug: "deadbolt-installation-repair",
    longDescription: "A quality deadbolt is your first line of defense. We install single-cylinder, double-cylinder, and smart deadbolts with reinforced strike plates and 3-inch screws for maximum kick-in resistance.",
    benefits: ["Reinforced strike plates", "Kick-in resistant installation", "Multiple deadbolt styles", "Same-day service"],
    categoryImage: imgDeadbolt,
    ctaText: "Reinforce Your Door Security",
  },
  "mailbox-gate-locks": {
    slug: "mailbox-gate-locks",
    longDescription: "Protect your mail from theft and secure your property perimeter with professional mailbox and gate lock installation. We service USPS-approved mailbox locks, gate latches, and padlocks for fences and sheds.",
    benefits: ["USPS-approved options", "Weather-resistant hardware", "Gate & fence solutions", "Padlock keyed-alike service"],
    categoryImage: imgMailboxGate,
    ctaText: "Secure Your Property Perimeter",
  },
  "master-key-systems-residential": {
    slug: "master-key-systems-residential",
    longDescription: "Simplify your keychain with a master key system. One key opens every door in your home while each family member can have unique keys for specific areas. Perfect for multi-unit properties or homes with many entry points.",
    benefits: ["One key for all doors", "Individual sub-keys available", "Scalable system design", "Professional installation"],
    categoryImage: imgMasterKeyRes,
    ctaText: "Simplify Your Access — Get a Quote",
  },
  // Commercial
  "commercial-lockout-services": {
    slug: "commercial-lockout-services",
    longDescription: "Every minute your business is locked up costs money. Our commercial lockout team arrives fast with specialized tools for office doors, storefronts, warehouses, and industrial facilities. We work quickly and cleanly to minimize downtime.",
    benefits: ["Rapid commercial response", "Specialized business tools", "Minimal downtime", "After-hours availability"],
    categoryImage: imgCommLockout,
    ctaText: "Get Your Business Open — Call Now",
  },
  "business-lock-installation-repair": {
    slug: "business-lock-installation-repair",
    longDescription: "Commercial properties demand Grade-1 locks that withstand heavy daily use. We install and repair commercial-grade hardware from Corbin Russwin, BEST, and Sargent for offices, storefronts, and warehouses.",
    benefits: ["Grade-1 commercial hardware", "Heavy-duty daily use rated", "Top commercial brands", "ADA-compliant options"],
    categoryImage: imgBizLock,
    ctaText: "Protect Your Business Today",
  },
  "commercial-rekeying": {
    slug: "commercial-rekeying",
    longDescription: "Employee turnover, security breaches, or lost keys? Rekey all your business locks efficiently in one visit. We can also set up a restricted keyway so keys cannot be copied without your authorization.",
    benefits: ["One-visit full rekeying", "Restricted keyway available", "Employee access management", "Cost-effective security reset"],
    categoryImage: imgCommRekey,
    ctaText: "Reset Your Business Security",
  },
  "master-key-system-design": {
    slug: "master-key-system-design",
    longDescription: "Design a hierarchical access system where managers have master keys, department heads have sub-masters, and employees have individual keys. We engineer systems for buildings of any size with full documentation.",
    benefits: ["Custom hierarchy design", "Full documentation provided", "Scalable for any building", "Restricted key duplication"],
    categoryImage: imgMasterKeyDesign,
    ctaText: "Design Your Access System",
  },
  "access-control-systems": {
    slug: "access-control-systems",
    longDescription: "Upgrade from keys to electronic access control. We install and maintain keypad entry, proximity card readers, biometric scanners, and cloud-managed systems that let you control who enters, when, and track every access event.",
    benefits: ["Keypad, card & biometric options", "Cloud-managed access logs", "Time-based access rules", "Integration with security systems"],
    categoryImage: imgAccessControl,
    ctaText: "Modernize Your Access Control",
  },
  "high-security-commercial-locks": {
    slug: "high-security-commercial-locks",
    longDescription: "For banks, jewelry stores, data centers, and high-value properties, we install maximum-security hardware with anti-pick, anti-drill, and anti-snap protections plus patented key control systems.",
    benefits: ["Maximum security rating", "Patented key control", "Insurance-grade hardware", "Tamper-evident features"],
    categoryImage: imgHighSecComm,
    ctaText: "Maximum Security for Your Business",
  },
  "office-storefront-locks": {
    slug: "office-storefront-locks",
    longDescription: "From aluminum storefront doors to solid-core office doors, we install the right lock for every commercial door type including mortise locks, cylindrical locks, and glass door locks.",
    benefits: ["All door types supported", "Storefront specialists", "Glass door solutions", "ADA-compliant hardware"],
    categoryImage: imgStorefront,
    ctaText: "Professional Lock Solutions",
  },
  "panic-bars-exit-devices": {
    slug: "panic-bars-exit-devices",
    longDescription: "Stay code-compliant with professionally installed panic bars and exit devices. We install, repair, and maintain push bars, rim exit devices, and vertical rod assemblies per NFPA and local fire codes.",
    benefits: ["Fire code compliant", "Professional installation", "Repair & maintenance", "Multiple device types"],
    categoryImage: imgPanicBar,
    ctaText: "Stay Compliant — Get Installed Today",
  },
  "file-cabinet-desk-locks": {
    slug: "file-cabinet-desk-locks",
    longDescription: "Protect sensitive documents, employee files, and valuable equipment with secure file cabinet and desk locks. We open, repair, rekey, and replace locks on all major furniture brands.",
    benefits: ["All furniture brands", "Open locked cabinets", "Rekey existing locks", "High-security upgrades"],
    categoryImage: imgFileCabinet,
    ctaText: "Secure Your Sensitive Documents",
  },
  "key-control-restricted-keys": {
    slug: "key-control-restricted-keys",
    longDescription: "Prevent unauthorized key duplication with patented restricted key systems. Keys can only be cut by authorized dealers with proper credentials, giving you complete control over who has access.",
    benefits: ["Unauthorized duplication impossible", "Complete access control", "Audit trail available", "Dealer-only key cutting"],
    categoryImage: imgKeyControl,
    ctaText: "Take Control of Your Keys",
  },
  // Automotive
  "car-lockout-services": {
    slug: "car-lockout-services",
    longDescription: "Locked your keys in the car? Our mobile automotive locksmiths reach you fast anywhere in Greater Cleveland. We use professional auto-entry tools that won't scratch your paint, damage weatherstripping, or trigger your alarm.",
    benefits: ["No vehicle damage guaranteed", "All makes and models", "Parking lot & roadside service", "20–30 minute arrival"],
    categoryImage: imgCarLockout,
    ctaText: "Locked Out of Your Car? Call Now",
  },
  "car-key-replacement": {
    slug: "car-key-replacement",
    longDescription: "Lost all your car keys? No need for an expensive dealer visit or tow. We cut and program new keys on-site for most makes and models at a fraction of dealership prices. Transponder, remote-head, and smart keys all available.",
    benefits: ["60-70% less than dealer", "On-site programming", "All key types available", "No tow needed"],
    categoryImage: imgCarKey,
    ctaText: "Get New Car Keys — Save vs Dealer",
  },
  "transponder-key-programming": {
    slug: "transponder-key-programming",
    longDescription: "Modern vehicles use transponder chips for anti-theft protection. We program new transponder keys and clone existing ones using professional-grade equipment compatible with Ford, GM, Toyota, Honda, Nissan, and more.",
    benefits: ["Professional-grade equipment", "Most makes & models", "Anti-theft chip programming", "Fraction of dealer cost"],
    categoryImage: imgTransponder,
    ctaText: "Program Your Transponder Key",
  },
  "remote-key-fob-programming": {
    slug: "remote-key-fob-programming",
    longDescription: "Get your remote key fob, smart key, or push-to-start fob programmed without visiting the dealer. We program OEM and aftermarket remotes for keyless entry, trunk release, and panic button functions.",
    benefits: ["OEM & aftermarket fobs", "Keyless entry programming", "Push-to-start capable", "Same-day service"],
    categoryImage: imgKeyFob,
    ctaText: "Program Your Key Fob Today",
  },
  "ignition-repair-replacement": {
    slug: "ignition-repair-replacement",
    longDescription: "If your key won't turn, gets stuck, or the ignition cylinder is worn out, we repair and replace ignition systems on-site. No tow truck needed — we come to you with all necessary parts and equipment.",
    benefits: ["On-site ignition repair", "No tow required", "Worn cylinder replacement", "Key extraction included"],
    categoryImage: imgIgnitionRepair,
    ctaText: "Fix Your Ignition — Call Now",
  },
  "ignition-key-cutting-rebuilding": {
    slug: "ignition-key-cutting-rebuilding",
    longDescription: "We precision-cut new ignition keys using your vehicle's key code and rebuild worn ignition cylinders to factory specifications. This restores smooth key operation and reliable starting.",
    benefits: ["Precision key code cutting", "Cylinder rebuilding", "Factory-spec restoration", "Smooth operation guaranteed"],
    categoryImage: imgIgnitionKey,
    ctaText: "Get Your Ignition Restored",
  },
  "broken-key-extraction": {
    slug: "broken-key-extraction",
    longDescription: "A broken key stuck in your lock or ignition needs professional extraction to avoid further damage. Our technicians use specialized extraction tools to safely remove broken fragments and can cut a new key on the spot.",
    benefits: ["Safe fragment removal", "No lock damage", "New key cut on-site", "Works on all lock types"],
    categoryImage: imgBrokenKey,
    ctaText: "Extract Your Broken Key Now",
  },
  "key-decoding-vin-key-generation": {
    slug: "key-decoding-vin-key-generation",
    longDescription: "When all keys are lost, we can generate a new key using your Vehicle Identification Number (VIN). This process creates a factory-correct key without needing the original — saving you a dealer visit and tow.",
    benefits: ["No original key needed", "VIN-based generation", "Factory-correct cut", "Saves dealer & tow costs"],
    categoryImage: imgVinKey,
    ctaText: "Generate a Key from Your VIN",
  },
  "automotive-lock-rekeying": {
    slug: "automotive-lock-rekeying",
    longDescription: "After a theft attempt or lost keys, rekeying your vehicle's door and trunk locks ensures old keys no longer work. We rekey to match your new ignition key for single-key convenience.",
    benefits: ["Old keys disabled", "Matched to ignition key", "Theft recovery security", "Cost-effective solution"],
    categoryImage: imgAutoRekey,
    ctaText: "Rekey Your Vehicle Locks",
  },
};

export const getServiceDetail = (slug: string) => serviceDetails[slug];
