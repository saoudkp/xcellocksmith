import type { Access } from 'payload'

/**
 * Returns true if the request has an authenticated user.
 */
export const isAuthenticated: Access = ({ req }) => Boolean(req.user)

/**
 * Public read access, authenticated-only write access.
 * Used by: media, services, service-categories, service-areas,
 * team-members, faqs, gallery-items, vehicle-makes, vehicle-models.
 */
export const publicReadAdminWrite = {
  read: (() => true) as Access,
  create: isAuthenticated,
  update: isAuthenticated,
  delete: isAuthenticated,
}

/**
 * Reviews access: public read (approved only for unauthenticated),
 * public create, admin manage.
 */
export const reviewsAccess = {
  read: (({ req }) =>
    req.user ? true : { isApproved: { equals: true } }) as Access,
  create: (() => true) as Access,
  update: isAuthenticated,
  delete: isAuthenticated,
}

/**
 * Quote requests access: public create, admin read/manage.
 */
export const quoteRequestsAccess = {
  read: isAuthenticated,
  create: (() => true) as Access,
  update: isAuthenticated,
  delete: isAuthenticated,
}
