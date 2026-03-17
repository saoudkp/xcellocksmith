'use client'

/**
 * IconPickerPanel — Standalone icon picker + color picker panel for the
 * section heading editor.
 *
 * Reuses the same Lucide icon map from `IconPickerField` but without
 * Payload field context (`useField`).  Designed to be embedded directly
 * inside the WYSIWYG editor for sections that support icons (Contact
 * social links, Services categories).
 *
 * @see Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 2.6
 */

import React, { useState, useMemo } from 'react'
import {
  Home, Building2, Car, Key, Lock, Unlock, Shield, ShieldCheck, Star,
  Clock, Phone, PhoneCall, Mail, MapPin, Map, Navigation, Award, Badge,
  CheckCircle, AlertCircle, AlertTriangle, Info, HelpCircle, XCircle,
  Heart, ThumbsUp, ThumbsDown, Eye, EyeOff, Search, Settings, Wrench,
  Hammer, Zap, Bolt, Flame, Snowflake, Sun, Moon, Cloud, CloudRain,
  Truck, Package, Box, ShoppingCart, CreditCard, DollarSign, Wallet,
  Users, User, UserCheck, UserPlus, UserX, Contact, Fingerprint,
  Camera, Image, Video, Mic, Volume2, Bell, BellRing, Megaphone,
  Calendar, CalendarCheck, Timer, Hourglass, RotateCcw, RefreshCw,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronDown,
  ExternalLink, Link, Globe, Wifi, Signal, Smartphone, Laptop, Monitor,
  Printer, QrCode, Barcode, FileText, File, Folder, Clipboard, BookOpen,
  GraduationCap, Briefcase, Building, Store, Warehouse, Factory, Hospital,
  Church, Landmark, TreePine, Mountain, Waves, Anchor, Plane, Train, Bus,
  Bike, Footprints, Accessibility, CircleDot, Target, Crosshair, Compass,
  Lightbulb, Plug, Battery, Power, Gauge, Thermometer, Droplets, Wind,
  Sparkles, Crown, Gem, Gift, PartyPopper, Rocket, Flag, Bookmark,
  Tag, Tags, Hash, AtSign, Percent, PieChart, BarChart3, TrendingUp,
  Activity, Layers, Grid3X3, LayoutGrid, Columns3, Rows3, Table,
  type LucideIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Icon map (same set as IconPickerField)
// ---------------------------------------------------------------------------

const iconMap: Record<string, LucideIcon> = {
  Home, Building2, Car, Key, Lock, Unlock, Shield, ShieldCheck, Star,
  Clock, Phone, PhoneCall, Mail, MapPin, Map, Navigation, Award, Badge,
  CheckCircle, AlertCircle, AlertTriangle, Info, HelpCircle, XCircle,
  Heart, ThumbsUp, ThumbsDown, Eye, EyeOff, Search, Settings, Wrench,
  Hammer, Zap, Bolt, Flame, Snowflake, Sun, Moon, Cloud, CloudRain,
  Truck, Package, Box, ShoppingCart, CreditCard, DollarSign, Wallet,
  Users, User, UserCheck, UserPlus, UserX, Contact, Fingerprint,
  Camera, Image, Video, Mic, Volume2, Bell, BellRing, Megaphone,
  Calendar, CalendarCheck, Timer, Hourglass, RotateCcw, RefreshCw,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronDown,
  ExternalLink, Link, Globe, Wifi, Signal, Smartphone, Laptop, Monitor,
  Printer, QrCode, Barcode, FileText, File, Folder, Clipboard, BookOpen,
  GraduationCap, Briefcase, Building, Store, Warehouse, Factory, Hospital,
  Church, Landmark, TreePine, Mountain, Waves, Anchor, Plane, Train, Bus,
  Bike, Footprints, Accessibility, CircleDot, Target, Crosshair, Compass,
  Lightbulb, Plug, Battery, Power, Gauge, Thermometer, Droplets, Wind,
  Sparkles, Crown, Gem, Gift, PartyPopper, Rocket, Flag, Bookmark,
  Tag, Tags, Hash, AtSign, Percent, PieChart, BarChart3, TrendingUp,
  Activity, Layers, Grid3X3, LayoutGrid, Columns3, Rows3, Table,
}

const allIconNames = Object.keys(iconMap)

/** Resolve a Lucide icon component by name. Returns `null` if not found. */
export function getIconComponent(name: string | undefined | null): LucideIcon | null {
  if (!name) return null
  return iconMap[name] ?? null
}

// ---------------------------------------------------------------------------
// Preset colors for the inline color picker
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  '#ffffff', '#d1d5db', '#9ca3af', '#4b5563', '#000000',
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6',
  '#8b5cf6', '#a855f7', '#ec4899', '#06b6d4', '#14b8a6',
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface IconPickerPanelProps {
  /** Currently selected icon name (Lucide icon key). */
  iconName: string
  /** Currently selected icon color (hex string). */
  iconColor: string
  /** Called when the user picks a different icon. */
  onIconChange: (name: string) => void
  /** Called when the user picks a different icon color. */
  onColorChange: (color: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const IconPickerPanel: React.FC<IconPickerPanelProps> = ({
  iconName,
  iconColor,
  onIconChange,
  onColorChange,
}) => {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const filtered = useMemo(() => {
    if (!query) return allIconNames
    const q = query.toLowerCase()
    return allIconNames.filter((n) => n.toLowerCase().includes(q))
  }, [query])

  const CurrentIcon = getIconComponent(iconName)

  return (
    <div
      style={{
        marginBottom: 16,
        padding: 12,
        border: '1px solid var(--theme-elevation-150, #555)',
        borderRadius: 8,
        background: 'var(--theme-elevation-50, #1a1a1a)',
      }}
    >
      <label
        style={{
          display: 'block',
          marginBottom: 8,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--theme-text, #fff)',
        }}
      >
        Icon
      </label>

      {/* Preview + controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {/* Icon preview */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--theme-elevation-100, #333)',
            border: '1px solid var(--theme-elevation-150, #555)',
            flexShrink: 0,
          }}
        >
          {CurrentIcon ? (
            <CurrentIcon size={24} color={iconColor || '#ffffff'} />
          ) : (
            <span style={{ fontSize: 11, color: 'var(--theme-elevation-400, #888)' }}>—</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: 'var(--theme-elevation-500, #888)' }}>
            {iconName || 'No icon selected'}
          </span>
        </div>

        {/* Color swatch + picker toggle */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowColorPicker((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              fontSize: 11,
              borderRadius: 4,
              cursor: 'pointer',
              background: 'var(--theme-elevation-100, #333)',
              color: 'var(--theme-text, #fff)',
              border: '1px solid var(--theme-elevation-150, #555)',
            }}
            title="Icon Color"
          >
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                borderRadius: 3,
                background: iconColor || '#ffffff',
                border: '1px solid var(--theme-elevation-200, #666)',
              }}
            />
            Color
          </button>

          {showColorPicker && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 50,
                marginTop: 4,
                padding: 8,
                background: 'var(--theme-elevation-50, #222)',
                border: '1px solid var(--theme-elevation-150, #555)',
                borderRadius: 6,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
                width: 180,
              }}
            >
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onColorChange(c)
                    setShowColorPicker(false)
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 3,
                    background: c,
                    border:
                      iconColor === c
                        ? '2px solid var(--theme-text, #fff)'
                        : '1px solid var(--theme-elevation-150, #555)',
                    cursor: 'pointer',
                    outline: iconColor === c ? '1px solid var(--theme-elevation-500, #888)' : 'none',
                    outlineOffset: 1,
                  }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={iconColor || '#ffffff'}
                onChange={(e) => {
                  onColorChange(e.target.value)
                  setShowColorPicker(false)
                }}
                style={{
                  width: 24,
                  height: 24,
                  padding: 0,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                }}
                title="Custom color"
              />
            </div>
          )}
        </div>

        {/* Pick icon button */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: '4px 12px',
            fontSize: 11,
            borderRadius: 4,
            cursor: 'pointer',
            background: 'var(--theme-elevation-100, #333)',
            color: 'var(--theme-text, #fff)',
            border: '1px solid var(--theme-elevation-150, #555)',
          }}
        >
          {expanded ? 'Close' : 'Pick Icon'}
        </button>
      </div>

      {/* Expanded icon grid */}
      {expanded && (
        <div>
          <input
            type="text"
            placeholder="Search icons…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: 13,
              marginBottom: 8,
              borderRadius: 4,
              border: '1px solid var(--theme-elevation-150, #555)',
              background: 'var(--theme-elevation-0, #111)',
              color: 'var(--theme-text, #fff)',
            }}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
              gap: 4,
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            {filtered.map((name) => {
              const Icon = iconMap[name]
              const selected = iconName === name
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onIconChange(name)
                    setExpanded(false)
                    setQuery('')
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    padding: '6px 2px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: selected ? 'var(--theme-success-500, #22c55e)' : 'transparent',
                    border: selected
                      ? '2px solid var(--theme-success-500, #22c55e)'
                      : '1px solid transparent',
                    color: selected ? '#fff' : 'var(--theme-text, #ccc)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--theme-elevation-100, #333)'
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <Icon size={18} />
                  <span
                    style={{
                      fontSize: 8,
                      lineHeight: 1,
                      opacity: 0.6,
                      maxWidth: 52,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {name}
                  </span>
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <p
              style={{
                fontSize: 12,
                color: 'var(--theme-elevation-400, #666)',
                textAlign: 'center',
                padding: 16,
              }}
            >
              No icons match &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default IconPickerPanel
