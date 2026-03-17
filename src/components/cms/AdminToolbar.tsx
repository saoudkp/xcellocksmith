/**
 * AdminToolbar — floating bar shown when a Payload admin is viewing the frontend.
 * Provides quick links to the CMS admin panel and shows edit mode status.
 */
import { useState } from 'react';
import { Settings, ExternalLink, LogOut, Eye, EyeOff, X } from 'lucide-react';
import { useCmsAuth } from '@/contexts/CmsAuthContext';

const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000';

export default function AdminToolbar() {
  const { isAdmin, user, logout } = useCmsAuth();
  const [dismissed, setDismissed] = useState(false);
  const [editMode, setEditMode] = useState(true);

  if (!isAdmin || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-gray-900/95 backdrop-blur-xl text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/10 text-sm">
      <div className="flex items-center gap-2 pr-3 border-r border-white/20">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-white/70 text-xs">Editing as {user?.email}</span>
      </div>

      <button
        onClick={() => setEditMode(!editMode)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
        title={editMode ? 'Hide edit controls' : 'Show edit controls'}
      >
        {editMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        <span className="text-xs">{editMode ? 'Edit Mode' : 'Preview'}</span>
      </button>

      <a
        href={`${CMS_URL}/admin`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        <span className="text-xs">Admin</span>
        <ExternalLink className="w-3 h-3 text-white/50" />
      </a>

      <button
        onClick={logout}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition-colors text-red-400"
        title="Logout"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="text-xs">Logout</span>
      </button>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/50"
        title="Dismiss toolbar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
