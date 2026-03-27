import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import Users from './collections/Users'
import Media from './collections/Media'
import ServiceCategories from './collections/ServiceCategories'
import Services from './collections/Services'
import ServiceAreas from './collections/ServiceAreas'
import TeamMembers from './collections/TeamMembers'
import Reviews from './collections/Reviews'
import Faqs from './collections/Faqs'
import GalleryItems from './collections/GalleryItems'
import QuoteRequests from './collections/QuoteRequests'
import VehicleMakes from './collections/VehicleMakes'
import VehicleModels from './collections/VehicleModels'
import SiteSettings from './globals/SiteSettings'
import HomepageLayout from './globals/HomepageLayout'
import Navigation from './globals/Navigation'
import HeroSettings from './globals/HeroSettings'
import PageSectionSettings from './globals/PageSectionSettings'
import WhatsAppSettings from './globals/WhatsAppSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      url: process.env.LIVE_PREVIEW_URL || 'http://localhost:5173',
      globals: ['site-settings', 'homepage-layout', 'navigation', 'hero-settings', 'sections-settings'],
      collections: ['services', 'service-categories', 'service-areas', 'reviews', 'faqs', 'gallery-items', 'team-members'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
    meta: {
      titleSuffix: ' — Xcel Locksmith',
      description: 'Xcel Locksmith Content Management',
    },
    components: {
      graphics: {
        Logo: '/components/AdminLogo',
        Icon: '/components/AdminIcon',
      },
      header: ['/components/HeaderHelp'],
      beforeNavLinks: ['/components/NavLogo'],
      beforeDashboard: [
        '/components/DashboardStats',
        '/components/LeadPipeline',
        '/components/DashboardNav',
      ],
      afterDashboard: ['/components/DashboardFooter'],
    },
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          disableLocalStorage: !!process.env.S3_ENDPOINT,
        },
      },
      bucket: process.env.S3_BUCKET || 'xcel-media',
      config: {
        endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
          secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
        },
        region: process.env.S3_REGION || 'us-east-1',
        forcePathStyle: true,
      },
    }),
  ],
  collections: [
    Users,
    Media,
    ServiceCategories,
    Services,
    ServiceAreas,
    TeamMembers,
    Reviews,
    Faqs,
    GalleryItems,
    QuoteRequests,
    VehicleMakes,
    VehicleModels, // Legacy — models now inline in VehicleMakes, kept to avoid DB migration
  ],
  globals: [PageSectionSettings, HeroSettings, SiteSettings, HomepageLayout, Navigation, WhatsAppSettings],
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  cors: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    process.env.NEXT_PUBLIC_SITE_URL || '',
    process.env.NEXT_PUBLIC_SITE_URL ? `https://www.${new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname}` : '',
    process.env.NEXT_PUBLIC_SITE_URL ? `https://cms.${new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname}` : '',
  ].filter(Boolean),
  csrf: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    process.env.NEXT_PUBLIC_SITE_URL || '',
    process.env.NEXT_PUBLIC_SITE_URL ? `https://www.${new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname}` : '',
    process.env.NEXT_PUBLIC_SITE_URL ? `https://cms.${new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname}` : '',
  ].filter(Boolean),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  sharp,
})
