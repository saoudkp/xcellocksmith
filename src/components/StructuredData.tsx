import { useFaqs, useServices, useLocations, useTeamMembers, useContact, useBrand } from "@/hooks/useCms";

export const LocalBusinessSchema = () => {
  const brand = useBrand();
  const contact = useContact();
  const locations = useLocations();
  const services = useServices();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Locksmith",
    name: brand.name,
    description: `24/7 emergency locksmith services in Cleveland, OH. Residential, commercial & automotive. Licensed, insured, no hidden fees.`,
    url: "https://xcellocksmith.com",
    telephone: brand.phoneNumber.replace("tel:", ""),
    email: contact.email || "info@xcellocksmith.com",
    priceRange: "$",
    image: "https://xcellocksmith.com/og-image.jpg",
    sameAs: [
      "https://facebook.com/xcellocksmith",
      "https://instagram.com/xcellocksmith",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cleveland",
      addressRegion: "OH",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.4993,
      longitude: -81.6944,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "347",
      bestRating: "5",
    },
    areaServed: locations.map(l => ({
      "@type": "City",
      name: l.cityName,
      "@id": `https://xcellocksmith.com/services/${l.slug}`,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Locksmith Services",
      itemListElement: services.filter(s => s.isActive).map(s => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.shortDescription,
        },
        priceSpecification: {
          "@type": "PriceSpecification",
          price: s.startingPrice,
          priceCurrency: "USD",
        },
      })),
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
};

export const FAQSchema = () => {
  const faqs = useFaqs();

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
};

export const TeamSchema = () => {
  const { members: team } = useTeamMembers();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Xcel Locksmith",
    url: "https://xcellocksmith.com",
    employee: team.map(m => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.role,
      description: m.bio,
      image: m.photoUrl,
      knowsAbout: m.specialties,
      hasCredential: m.certifications.map(c => ({
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Professional Certification",
        name: c.name,
        url: c.fileUrl,
      })),
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
};
