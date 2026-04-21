type GoogleGenerateLeadInput = {
  email?: string
  phoneNumber?: string
  firstName?: string
  lastName?: string
  street?: string
  city?: string
  region?: string
  postalCode?: string
  country?: string
}

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

const trimValue = (value?: string): string => (value || '').trim()

const compactStringRecord = (record: Record<string, string | undefined>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(record)
      .map(([key, value]) => [key, trimValue(value)] as const)
      .filter(([, value]) => Boolean(value))
  )

export const pushGoogleGenerateLead = ({
  email,
  phoneNumber,
  firstName,
  lastName,
  street,
  city,
  region,
  postalCode,
  country,
}: GoogleGenerateLeadInput) => {
  if (typeof window === 'undefined') return

  const userData: Record<string, string | Record<string, string>> = compactStringRecord({
    email,
    phone_number: phoneNumber,
    first_name: firstName,
    last_name: lastName,
  })

  const address = compactStringRecord({
    street,
    city,
    region,
    postal_code: postalCode,
    country,
  })

  if (Object.keys(address).length > 0) {
    userData.address = address
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'generate_lead',
    user_data: userData,
  })
}

