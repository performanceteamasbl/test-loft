type GoogleLeadCreatedInput = {
  eventId: string
  contentName: string
  value: number
  currency: string
  project: string
  configuration: string
  budget: string
  purpose: string
  source: string
  pageUrl: string
  referrer: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
}

type GoogleEventParams = Record<string, string | number>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const GOOGLE_ADS_ID = 'AW-798121015'
const DEFAULT_GOOGLE_ADS_LEAD_CONVERSION_LABEL = 'dMvGCNyeqp8cELe4yfwC'
const GOOGLE_ADS_LEAD_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_CONVERSION_LABEL?.trim() ||
  DEFAULT_GOOGLE_ADS_LEAD_CONVERSION_LABEL

const trimValue = (value?: string): string => (value || '').trim()

const compactParams = (params: GoogleEventParams): GoogleEventParams =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (typeof value === 'number') return Number.isFinite(value)
      return Boolean(trimValue(value))
    })
  )

export const trackGoogleLeadCreated = ({
  eventId,
  contentName,
  value,
  currency,
  project,
  configuration,
  budget,
  purpose,
  source,
  pageUrl,
  referrer,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  utm_term,
}: GoogleLeadCreatedInput) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  const eventParams = compactParams({
    event_id: eventId,
    event_category: 'lead',
    event_label: 'LEAD_CREATED',
    lead_event_name: 'LEAD_CREATED',
    content_name: contentName,
    value,
    currency,
    project,
    configuration,
    budget,
    purpose,
    lead_source: source,
    page_location: pageUrl,
    page_referrer: referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
  })

  window.gtag('event', 'LEAD_CREATED', {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_CONVERSION_LABEL}`,
    transaction_id: eventId,
    ...eventParams,
  })
}
