/**
 * EditableText — inline text editing for CMS-managed content.
 *
 * Shows a pencil icon on hover when the user is a logged-in admin.
 * Click to edit inline, press Enter or blur to save back to Payload.
 */
import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { useCmsAuth } from '@/contexts/CmsAuthContext';
import { useQueryClient } from '@tanstack/react-query';
import type { LexicalJSON } from '@/components/cms/RichTextHeading';

// ---------------------------------------------------------------------------
// Lightweight Lexical ↔ plain text helpers (frontend-only, no CMS dependency)
// ---------------------------------------------------------------------------

/** Extract concatenated plain text from a Lexical JSON structure. */
export function lexicalToPlainText(json: LexicalJSON): string {
  if (!json?.root?.children) return '';
  const blocks: string[] = [];
  for (const block of json.root.children) {
    const parts: string[] = [];
    for (const child of block.children) {
      if (child.type === 'text' && child.text) parts.push(child.text);
      else if (child.type === 'linebreak') parts.push('\n');
    }
    blocks.push(parts.join(''));
  }
  return blocks.join('\n');
}

/** Wrap plain text in a minimal valid Lexical JSON structure. */
export function plainTextToLexical(text: string): LexicalJSON {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          version: 1,
        },
      ],
      version: 1,
    },
  };
}

const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000';

interface EditableTextProps {
  /** The displayed text value */
  value: string;
  /** Payload field name (e.g. 'phone', 'businessName') */
  field: string;
  /** 'global' for globals, 'collection' for collection docs */
  entityType: 'global' | 'collection';
  /** Slug of the global or collection (e.g. 'site-settings', 'services') */
  entitySlug: string;
  /** Document ID — required for collection items */
  entityId?: string | number;
  /** Nested field path for grouped fields (e.g. 'address.city') */
  fieldPath?: string;
  /** React Query cache key to invalidate after save */
  cacheKey?: string[];
  /** HTML tag to render */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  /** Pass-through className */
  className?: string;
  /** Pass-through style */
  style?: React.CSSProperties;
  /** Children to render instead of value (for complex content) */
  children?: React.ReactNode;
  /** Whether this is a multiline field */
  multiline?: boolean;
  /** Lexical JSON content for rich text fields — when provided, inline edits
   *  will be converted back to Lexical JSON on save. */
  richTextValue?: LexicalJSON | null;
  /** Dot-path inside publishedData to update with the Lexical JSON on save
   *  (e.g. 'publishedData.heading'). Required when richTextValue is set. */
  richTextFieldPath?: string;
}

export default function EditableText({
  value,
  field,
  entityType,
  entitySlug,
  entityId,
  fieldPath,
  cacheKey,
  as: Tag = 'span',
  className = '',
  style,
  children,
  multiline = false,
  richTextValue,
  richTextFieldPath,
}: EditableTextProps) {
  const { isAdmin } = useCmsAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    richTextValue ? lexicalToPlainText(richTextValue) : value,
  );
  const [saving, setSaving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(richTextValue ? lexicalToPlainText(richTextValue) : value);
  }, [value, richTextValue]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (!isAdmin) {
    return <Tag className={className} style={style}>{children || value}</Tag>;
  }

  const save = async () => {
    const currentText = richTextValue ? lexicalToPlainText(richTextValue) : value;
    if (draft === currentText) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const path = fieldPath || field;
      const parts = path.split('.');

      const url =
        entityType === 'global'
          ? `${CMS_URL}/api/globals/${entitySlug}`
          : `${CMS_URL}/api/${entitySlug}/${entityId}`;

      const method = entityType === 'global' ? 'POST' : 'PATCH';

      // Check if path contains an array index (e.g. badges.0.text)
      const hasArrayIndex = parts.some((p) => /^\d+$/.test(p));

      let body: Record<string, unknown>;

      if (hasArrayIndex) {
        // For array fields, fetch current data, update the item, send full array
        const current = await fetch(url, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }).then((r) => r.json());

        // Walk the path and set the value on the fetched data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let target: any = current;
        for (let i = 0; i < parts.length - 1; i++) {
          const key = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
          target = target[key];
        }
        target[parts[parts.length - 1]] = draft;

        // Send only the top-level array field
        body = { [parts[0]]: current[parts[0]] };
      } else if (parts.length === 1) {
        body = { [parts[0]]: draft };
      } else {
        // Nested group: { address: { city: "value" } }
        body = {};
        let current: Record<string, unknown> = body;
        for (let i = 0; i < parts.length - 1; i++) {
          current[parts[i]] = {};
          current = current[parts[i]] as Record<string, unknown>;
        }
        current[parts[parts.length - 1]] = draft;
      }

      // When editing a rich text field, also update the publishedData Lexical JSON
      if (richTextValue && richTextFieldPath) {
        const lexical = plainTextToLexical(draft);
        const rtParts = richTextFieldPath.split('.');
        let node: Record<string, unknown> = body;
        for (let i = 0; i < rtParts.length - 1; i++) {
          if (!node[rtParts[i]] || typeof node[rtParts[i]] !== 'object') {
            node[rtParts[i]] = {};
          }
          node = node[rtParts[i]] as Record<string, unknown>;
        }
        node[rtParts[rtParts.length - 1]] = lexical;
      }

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);

      // Invalidate cache so the hook refetches
      if (cacheKey) {
        queryClient.invalidateQueries({ queryKey: cacheKey });
      } else {
        queryClient.invalidateQueries({ queryKey: ['cms'] });
      }
    } catch (err) {
      console.error('Inline edit save failed:', err);
      setDraft(value); // revert
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      save();
    }
    if (e.key === 'Escape') {
      cancel();
    }
  };

  if (editing) {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`} style={style}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
            rows={3}
            className="bg-white px-2 py-1 rounded border-2 border-blue-500 outline-none font-inherit w-full min-w-[200px] resize-y"
            style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', color: '#000000' }}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
            className="bg-white px-2 py-1 rounded border-2 border-blue-500 outline-none font-inherit min-w-[100px]"
            style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', color: '#000000', width: `${Math.max(draft.length + 2, 10)}ch` }}
          />
        )}
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        ) : (
          <>
            <button onClick={save} className="p-1 rounded hover:bg-green-500/20" title="Save">
              <Check className="w-4 h-4 text-green-500" />
            </button>
            <button onClick={cancel} className="p-1 rounded hover:bg-red-500/20" title="Cancel">
              <X className="w-4 h-4 text-red-500" />
            </button>
          </>
        )}
      </span>
    );
  }

  return (
    <Tag
      className={`relative group/editable cursor-pointer ${className}`}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') setEditing(true); }}
      title={`Click to edit: ${field}`}
    >
      {children || value}
      {hovered && (
        <span className="absolute -top-2 -right-2 z-50 bg-blue-600 text-white rounded-full p-1 shadow-lg animate-in fade-in zoom-in duration-150">
          <Pencil className="w-3 h-3" />
        </span>
      )}
    </Tag>
  );
}
