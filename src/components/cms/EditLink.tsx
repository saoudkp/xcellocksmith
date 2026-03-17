/**
 * EditLink — shows a small edit icon that links to the Payload admin
 * for a specific collection item or global. For items where inline
 * editing isn't practical (rich text, images, arrays).
 */
import { Pencil } from 'lucide-react';
import { useCmsAuth } from '@/contexts/CmsAuthContext';

const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000';

interface EditLinkProps {
  /** 'global' or 'collection' */
  entityType: 'global' | 'collection';
  /** Slug (e.g. 'site-settings', 'services') */
  entitySlug: string;
  /** Document ID for collections */
  entityId?: string | number;
  /** Optional label */
  label?: string;
  /** Position style */
  className?: string;
  /** Section key for auto-selecting dropdown in Page Section Settings */
  section?: string;
}

export default function EditLink({
  entityType,
  entitySlug,
  entityId,
  label,
  className = '',
  section,
}: EditLinkProps) {
  const { isAdmin } = useCmsAuth();
  if (!isAdmin) return null;

  let href =
    entityType === 'global'
      ? `${CMS_URL}/admin/globals/${entitySlug}`
      : `${CMS_URL}/admin/collections/${entitySlug}/${entityId}`;

  // Append ?section= query param for Page Section Settings auto-selection
  if (section && entityType === 'global') {
    href += `?section=${encodeURIComponent(section)}`;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-lg transition-colors z-50 ${className}`}
      title={label || `Edit in CMS`}
    >
      <Pencil className="w-3 h-3" />
      {label && <span>{label}</span>}
    </a>
  );
}
