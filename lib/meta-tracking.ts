export type MetaBrowserTracking = {
  fbp: string
  fbc: string
  eventSourceUrl: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string
  utm_content: string
}

type MetaLeadUserInput = {
  name?: string
  email?: string
  phone?: string
  countryCode?: string
  city?: string
  state?: string
  country?: string
  zip?: string
}

type BuildMetaLeadPayloadInput = {
  eventId: string
  user: MetaLeadUserInput
  tracking: MetaBrowserTracking
}

const trimValue = (value?: string): string => (value || '').trim()

const normalizeLower = (value?: string): string => trimValue(value).toLowerCase()

const normalizeCountryCode = (countryCode?: string): string => {
  const code = trimValue(countryCode)
  if (!code) return ''
  return code.startsWith('+') ? code : `+${code}`
}

const normalizePhoneWithCountryCode = (phone?: string, countryCode?: string): string => {
  const phoneDigits = trimValue(phone).replace(/\D/g, '')
  const ccDigits = normalizeCountryCode(countryCode).replace(/\D/g, '')
  if (!phoneDigits) return ''
  return `${ccDigits}${phoneDigits}`
}

const getCookieValue = (name: string): string => {
  if (typeof document === 'undefined') return ''

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

const setCookieValue = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`
}

const toFbc = (fbclid: string): string => {
  const timestamp = Math.floor(Date.now() / 1000)
  return `fb.1.${timestamp}.${fbclid}`
}

export const getMetaBrowserTracking = (): MetaBrowserTracking => {
  if (typeof window === 'undefined') {
    return {
      fbp: '',
      fbc: '',
      eventSourceUrl: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
    }
  }

  const params = new URLSearchParams(window.location.search)
  const fbclid = trimValue(params.get('fbclid') || '')
  let fbc = trimValue(getCookieValue('_fbc'))

  if (!fbc && fbclid) {
    fbc = toFbc(fbclid)
    setCookieValue('_fbc', fbc, 60 * 60 * 24 * 90)
  }

  return {
    fbp: trimValue(getCookieValue('_fbp')),
    fbc,
    eventSourceUrl: window.location.href,
    utm_source: trimValue(params.get('utm_source') || ''),
    utm_medium: trimValue(params.get('utm_medium') || ''),
    utm_campaign: trimValue(params.get('utm_campaign') || ''),
    utm_term: trimValue(params.get('utm_term') || ''),
    utm_content: trimValue(params.get('utm_content') || ''),
  }
}

export const buildMetaLeadPayload = ({ eventId, user, tracking }: BuildMetaLeadPayloadInput) => {
  return {
    eventId: trimValue(eventId),
    eventSourceUrl: tracking.eventSourceUrl,
    fbp: tracking.fbp,
    fbc: tracking.fbc,
    utm_source: tracking.utm_source,
    utm_medium: tracking.utm_medium,
    utm_campaign: tracking.utm_campaign,
    utm_term: tracking.utm_term,
    utm_content: tracking.utm_content,
    name: trimValue(user.name),
    email: normalizeLower(user.email),
    phone: normalizePhoneWithCountryCode(user.phone, user.countryCode),
    city: normalizeLower(user.city),
    state: normalizeLower(user.state),
    country: trimValue(user.country),
    zip: normalizeLower(user.zip),
  }
}
