import EditLink from "@/components/cms/EditLink";
import RichTextHeading, { type RichContent } from "@/components/cms/RichTextHeading";

interface SectionHeaderProps {
  heading: string;
  subheading: string;
  sectionKey: string;
  className?: string;
  /** Rich text content for the heading (WYSIWYG HTML or Lexical JSON). */
  richHeading?: RichContent;
  /** Rich text content for the subheading (WYSIWYG HTML or Lexical JSON). */
  richSubheading?: RichContent;
}

export default function SectionHeader({ heading, subheading, sectionKey, className = "", richHeading, richSubheading }: SectionHeaderProps) {
  return (
    <div className={`text-center mb-12 relative ${className}`}>
      <EditLink 
        entityType="global" 
        entitySlug="sections-settings" 
        section={sectionKey}
        label={`Edit ${sectionKey}`}
        className="absolute -top-8 right-0" 
      />
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
        <RichTextHeading content={richHeading} fallbackText={heading} />
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        <RichTextHeading content={richSubheading} fallbackText={subheading} />
      </p>
    </div>
  );
}
