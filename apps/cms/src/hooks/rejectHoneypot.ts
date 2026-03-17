import { APIError } from 'payload'
import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Defense-in-depth hook that prevents quote-request document creation
 * when the honeypot field is filled (indicating a bot submission).
 *
 * The custom `/api/submit-quote` endpoint checks honeypot before reaching
 * this hook and returns a silent 200 OK. This hook acts as a safety net
 * for any other code path that creates quote-request documents directly.
 */
export const rejectHoneypot: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === 'create' && data?.honeypot && typeof data.honeypot === 'string' && data.honeypot.trim().length > 0) {
    throw new APIError('Submission rejected', 400, undefined, true)
  }

  return data
}

export default rejectHoneypot
