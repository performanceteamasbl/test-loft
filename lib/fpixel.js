export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

export const pageview = () => {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'PageView')
}

export const trackEvent = (name, options = {}, eventId) => {
  if (typeof window === 'undefined' || !window.fbq) return

  window.fbq('track', name, {
    ...options,
    eventID: eventId,
  })
}
