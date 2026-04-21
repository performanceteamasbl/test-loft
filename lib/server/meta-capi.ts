import { createHash } from 'node:crypto'

export type MetaLeadInput = {
  eventId: string
  email?: string
  name?: string
  phone?: string
  city?: string
  state?: string
  country?: string
  zip?: string
  fbp?: string
  fbc?: string
  eventSourceUrl?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

const trimValue = (value?: string): string => (value || '').trim()

const normalizeLower = (value?: string): string => trimValue(value).toLowerCase()

const normalizeAlpha = (value?: string): string => normalizeLower(value).replace(/[^a-z]/g, '')

const normalizeZip = (value?: string): string => normalizeLower(value).replace(/\s+/g, '')

const normalizePhone = (value?: string): string => trimValue(value).replace(/\D/g, '')

const splitFullName = (fullName?: string): { fn: string; ln: string } => {
  const tokens = trimValue(fullName).split(/\s+/).filter(Boolean)
  const fn = normalizeAlpha(tokens[0])
  const ln = normalizeAlpha(tokens.slice(1).join(' '))
  return { fn, ln }
}

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')

const addHashedIfPresent = (target: Record<string, string>, key: string, value: string) => {
  if (value) {
    target[key] = sha256(value)
  }
}

export const getClientIpAddress = (req: Request): string => {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || ''
  }

  return req.headers.get('x-real-ip')?.trim() || ''
}

export const getClientUserAgent = (req: Request): string => req.headers.get('user-agent')?.trim() || ''

export const buildMetaUserData = (input: MetaLeadInput, req: Request): Record<string, string> => {
  const userData: Record<string, string> = {}
  const { fn, ln } = splitFullName(input.name)

  addHashedIfPresent(userData, 'em', normalizeLower(input.email))
  addHashedIfPresent(userData, 'fn', fn)
  addHashedIfPresent(userData, 'ln', ln)
  addHashedIfPresent(userData, 'ph', normalizePhone(input.phone))
  addHashedIfPresent(userData, 'ct', normalizeAlpha(input.city))
  addHashedIfPresent(userData, 'st', normalizeAlpha(input.state))
  addHashedIfPresent(userData, 'country', normalizeAlpha(input.country))
  addHashedIfPresent(userData, 'zp', normalizeZip(input.zip))

  const fbp = trimValue(input.fbp)
  if (fbp) {
    userData.fbp = fbp
  }

  const fbc = trimValue(input.fbc)
  if (fbc) {
    userData.fbc = fbc
  }

  const clientIpAddress = getClientIpAddress(req)
  if (clientIpAddress) {
    userData.client_ip_address = clientIpAddress
  }

  const clientUserAgent = getClientUserAgent(req)
  if (clientUserAgent) {
    userData.client_user_agent = clientUserAgent
  }

  // Always provide external_id for deterministic matching fallback.
  userData.external_id = sha256(trimValue(input.eventId))

  return userData
}

export const buildMetaCustomData = (input: MetaLeadInput): Record<string, string> => {
  const customDataEntries = Object.entries({
    utm_source: trimValue(input.utm_source),
    utm_medium: trimValue(input.utm_medium),
    utm_campaign: trimValue(input.utm_campaign),
    utm_term: trimValue(input.utm_term),
    utm_content: trimValue(input.utm_content),
  }).filter(([, value]) => Boolean(value))

  return Object.fromEntries(customDataEntries)
}

export const normalizeEventSourceUrl = (value?: string): string => trimValue(value)
