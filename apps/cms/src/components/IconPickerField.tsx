'use client'

import React, { useState, useMemo } from 'react'
import { useField } from '@payloadcms/ui'
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

type Props = { path: string }

const IconPickerField: React.FC<Props> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)

  const filtered = useMemo(() => {
    if (!query) return allIconNames
    const q = query.toLowerCase()
    return allIconNames.filter((n) => n.toLowerCase().includes(q))
  }, [query])

  const CurrentIcon = value ? iconMap[value] || null : null

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Current selection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {CurrentIcon && (
          <div style={{
            width: 36, height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--theme-elevation-100, #333)', border: '1px solid var(--theme-elevation-150, #555)',
          }}>
            <CurrentIcon size={20} />
          </div>
        )}
        <span style={{ fontSize: 13, color: 'var(--theme-elevation-500, #888)' }}>
          {value || 'No icon selected'}
        </span>
        <button type="button" onClick={() => setExpanded(!expanded)} style={{
          marginLeft: 'auto', padding: '4px 12px', fontSize: 12, borderRadius: 4, cursor: 'pointer',
          background: 'var(--theme-elevation-100, #333)', color: 'var(--theme-text, #fff)',
          border: '1px solid var(--theme-elevation-150, #555)',
        }}>
          {expanded ? 'Close' : 'Pick Icon'}
        </button>
      </div>

      {expanded && (
        <div style={{
          border: '1px solid var(--theme-elevation-150, #555)', borderRadius: 8,
          padding: 12, background: 'var(--theme-elevation-50, #1a1a1a)',
        }}>
          <input
            type="text"
            placeholder="Search icons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', padding: '6px 10px', fontSize: 13, marginBottom: 10, borderRadius: 4,
              border: '1px solid var(--theme-elevation-150, #555)',
              background: 'var(--theme-elevation-0, #111)', color: 'var(--theme-text, #fff)',
            }}
          />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
            gap: 4, maxHeight: 260, overflowY: 'auto',
          }}>
            {filtered.map((name) => {
              const Icon = iconMap[name]
              const selected = value === name
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => { setValue(name); setExpanded(false); setQuery('') }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    padding: '6px 2px', borderRadius: 6, cursor: 'pointer',
                    background: selected ? 'var(--theme-success-500, #22c55e)' : 'transparent',
                    border: selected ? '2px solid var(--theme-success-500, #22c55e)' : '1px solid transparent',
                    color: selected ? '#fff' : 'var(--theme-text, #ccc)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--theme-elevation-100, #333)' }}
                  onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <Icon size={18} />
                  <span style={{ fontSize: 8, lineHeight: 1, opacity: 0.6, maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </span>
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--theme-elevation-400, #666)', textAlign: 'center', padding: 16 }}>
              No icons match "{query}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default IconPickerField
