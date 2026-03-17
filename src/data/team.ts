export interface CertificationProof {
  name: string;
  fileUrl: string; // image or PDF URL
  fileType: "image" | "pdf";
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  experience: string;
  bio: string;
  certifications: CertificationProof[];
  specialties: string[];
  photoUrl: string;
  isActive: boolean;
}

export const teamMembers: TeamMember[] = [
  {
    id: "t1",
    name: "Marcus Johnson",
    role: "Master Locksmith & Owner",
    experience: "18+ years",
    bio: "Marcus founded Xcel Locksmith after earning his Master Locksmith certification from ALOA. He specializes in high-security installations and has personally completed over 15,000 service calls across Greater Cleveland.",
    certifications: [
      { name: "ALOA Certified Master Locksmith (CML)", fileUrl: "/certificates/cert-marcus-cml.jpg", fileType: "image" },
      { name: "SAVTA Safe Technician", fileUrl: "/certificates/cert-marcus-savta.jpg", fileType: "image" },
      { name: "Ohio Licensed Locksmith", fileUrl: "/certificates/cert-marcus-ohio.jpg", fileType: "image" },
    ],
    specialties: ["High-Security Locks", "Safe Opening", "Master Key Systems"],
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    isActive: true,
  },
  {
    id: "t2",
    name: "David Chen",
    role: "Lead Automotive Specialist",
    experience: "12+ years",
    bio: "David is our go-to automotive locksmith, trained in transponder programming, smart key systems, and ignition repair for all major vehicle brands. He carries equipment for over 200 vehicle models in his service van.",
    certifications: [
      { name: "ALOA Certified Automotive Locksmith", fileUrl: "/certificates/cert-david-auto.jpg", fileType: "image" },
      { name: "Lishi Tool Certified", fileUrl: "/certificates/cert-david-lishi.jpg", fileType: "image" },
      { name: "Ohio Licensed Locksmith", fileUrl: "/certificates/cert-david-ohio.jpg", fileType: "image" },
    ],
    specialties: ["Transponder Programming", "Smart Key Systems", "Ignition Repair"],
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    isActive: true,
  },
  {
    id: "t3",
    name: "Sarah Williams",
    role: "Commercial Security Consultant",
    experience: "10+ years",
    bio: "Sarah designs and implements commercial security solutions for businesses ranging from small offices to large warehouses. She's an expert in access control systems, master key hierarchies, and code compliance.",
    certifications: [
      { name: "ALOA Certified Professional Locksmith (CPL)", fileUrl: "/certificates/cert-sarah-cpl.jpg", fileType: "image" },
      { name: "Access Control Specialist", fileUrl: "/certificates/cert-sarah-access.jpg", fileType: "image" },
      { name: "Ohio Licensed Locksmith", fileUrl: "/certificates/cert-sarah-ohio.jpg", fileType: "image" },
    ],
    specialties: ["Access Control", "Master Key Design", "Security Audits"],
    photoUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face",
    isActive: true,
  },
  {
    id: "t4",
    name: "James Rodriguez",
    role: "Emergency Response Lead",
    experience: "8+ years",
    bio: "James leads our 24/7 emergency response team, specializing in residential and commercial lockouts. Known for his calm demeanor and lightning-fast response times, he's helped thousands of Cleveland residents get back inside safely.",
    certifications: [
      { name: "ALOA Certified Registered Locksmith (CRL)", fileUrl: "/certificates/cert-james-crl.jpg", fileType: "image" },
      { name: "First Aid & CPR Certified", fileUrl: "/certificates/cert-james-firstaid.jpg", fileType: "image" },
      { name: "Ohio Licensed Locksmith", fileUrl: "/certificates/cert-james-ohio.jpg", fileType: "image" },
    ],
    specialties: ["Emergency Lockouts", "Lock Repair", "Residential Security"],
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    isActive: true,
  },
];

export const getActiveTeam = () => teamMembers.filter(m => m.isActive);
