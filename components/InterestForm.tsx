'use client'

import { useEffect, useState, useRef } from 'react'
import { MotionButton } from '@/components/ui/hover-effects'

type FormState = {
  name: string
  phone: string
  email: string
  budget: string
  purpose: 'Self Use' | 'Investment'
  message: string
}

type TrackingState = {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
  page_url: string
  referrer: string
  source: string
}

type GeoState = {
  city: string
  country: string
  country_code: string
}

type CountryOption = {
  name: string
  short: string
  dialCode: string
}

const CRM_ENDPOINT = 'https://asbl-crm-api.vercel.app/api/ingest/website'
const PROJECT = 'LOFT'
const CONFIGURATION = '3BHK'
const DEFAULT_COUNTRY_CODE = '+91'
const FALLBACK_COUNTRY_OPTIONS: CountryOption[] = [
  { name: 'India', short: 'IN', dialCode: '+91' },
  { name: 'United States', short: 'US', dialCode: '+1' },
  { name: 'United Kingdom', short: 'GB', dialCode: '+44' },
  { name: 'United Arab Emirates', short: 'AE', dialCode: '+971' },
  { name: 'Singapore', short: 'SG', dialCode: '+65' },
  { name: 'Australia', short: 'AU', dialCode: '+61' },
  { name: 'Canada', short: 'CA', dialCode: '+1' },
]

const getReferrerDomain = (referrer: string): string => {
  try {
    return referrer ? new URL(referrer).hostname : ''
  } catch {
    return ''
  }
}

const splitFullName = (fullName: string): { first_name: string; last_name: string } => {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean)
  const first_name = tokens[0] ?? ''
  const last_name = tokens.slice(1).join(' ')
  return { first_name, last_name }
}

const normalizeCountryCode = (code?: string): string => {
  if (!code) return DEFAULT_COUNTRY_CODE
  return code.startsWith('+') ? code : `+${code}`
}

const formatPhoneWithCountryCode = (rawPhone: string, countryCode: string): string => {
  const digits = rawPhone.replace(/\D/g, '')
  const normalizedCode = normalizeCountryCode(countryCode)
  return `${normalizedCode}${digits}`
}

type InterestFormProps = {
  asPopup?: boolean
}

export default function InterestForm({ asPopup = false }: InterestFormProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
    budget: '',
    purpose: 'Self Use',
    message: '',
  })
  const [trackingData, setTrackingData] = useState<TrackingState>({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    page_url: '',
    referrer: '',
    source: 'direct',
  })
  const [geoData, setGeoData] = useState<GeoState>({
    city: '',
    country: '',
    country_code: DEFAULT_COUNTRY_CODE,
  })
  const [selectedCountryShort, setSelectedCountryShort] = useState('IN')
  const [selectedCountryCode, setSelectedCountryCode] = useState(DEFAULT_COUNTRY_CODE)
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>(FALLBACK_COUNTRY_OPTIONS)
  const ref = useRef(null)

  useEffect(() => {
    if (asPopup) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [asPopup])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utm_source = params.get('utm_source') ?? ''
    const utm_medium = params.get('utm_medium') ?? ''
    const utm_campaign = params.get('utm_campaign') ?? ''
    const utm_content = params.get('utm_content') ?? ''
    const utm_term = params.get('utm_term') ?? ''
    const page_url = window.location.href
    const referrer = document.referrer || ''
    const source = utm_source || getReferrerDomain(referrer) || 'direct'

    setTrackingData({
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      page_url,
      referrer,
      source,
    })
  }, [])

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        const detectedShort = ((data?.country || data?.country_code || '') as string).toUpperCase()
        const detectedDialCode = normalizeCountryCode(data?.country_calling_code)

        setGeoData({
          city: data?.city || '',
          country: detectedShort,
          country_code: detectedDialCode,
        })
        setSelectedCountryCode(detectedDialCode)
        if (detectedShort) {
          setSelectedCountryShort(detectedShort)
        }
      } catch {
        setGeoData((prev) => ({
          ...prev,
          country_code: DEFAULT_COUNTRY_CODE,
        }))
        setSelectedCountryShort('IN')
        setSelectedCountryCode(DEFAULT_COUNTRY_CODE)
      }
    }

    fetchGeoData()
  }, [])

  useEffect(() => {
    const fetchCountryOptions = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2')
        const countries = await response.json()

        const options: CountryOption[] = countries
          .flatMap((country: { name?: { common?: string }; idd?: { root?: string; suffixes?: string[] }; cca2?: string }) => {
            const countryName = country?.name?.common
            const root = country?.idd?.root
            const suffixes = country?.idd?.suffixes
            const short = country?.cca2

            if (!countryName || !root || !suffixes?.length || !short) {
              return []
            }

            return [{
              name: countryName,
              short: short.toUpperCase(),
              dialCode: normalizeCountryCode(`${root}${suffixes[0]}`),
            }]
          })
          .filter(
            (option: CountryOption, index: number, arr: CountryOption[]) =>
              arr.findIndex((item: CountryOption) => item.short === option.short) === index
          )
          .sort((a: CountryOption, b: CountryOption) => a.name.localeCompare(b.name))

        if (options.length > 0) {
          setCountryOptions(options)
        }
      } catch {
        setCountryOptions(FALLBACK_COUNTRY_OPTIONS)
      }
    }

    fetchCountryOptions()
  }, [])

  useEffect(() => {
    const matchedByShort = countryOptions.find((option) => option.short === selectedCountryShort)

    if (matchedByShort && matchedByShort.dialCode !== selectedCountryCode) {
      setSelectedCountryCode(matchedByShort.dialCode)
      return
    }

    const matchedByCode = countryOptions.find((option) => option.dialCode === selectedCountryCode)
    if (matchedByCode && matchedByCode.short !== selectedCountryShort) {
      setSelectedCountryShort(matchedByCode.short)
    }
  }, [countryOptions, selectedCountryShort, selectedCountryCode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const { first_name, last_name } = splitFullName(formData.name)
      const effectiveCountryCode = selectedCountryCode || geoData.country_code || DEFAULT_COUNTRY_CODE
      const phone = formatPhoneWithCountryCode(formData.phone, effectiveCountryCode)
      const payload = {
        name: formData.name.trim(),
        first_name,
        last_name,
        phone,
        email: formData.email.trim(),
        project: PROJECT,
        configuration: CONFIGURATION,
        budget: formData.budget,
        purpose: formData.purpose,
        message: formData.message,
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        utm_content: trackingData.utm_content,
        utm_term: trackingData.utm_term,
        page_url: trackingData.page_url,
        referrer: trackingData.referrer,
        city: geoData.city,
        country: selectedCountryShort || geoData.country,
        country_code: normalizeCountryCode(effectiveCountryCode),
        source: trackingData.source,
      }

      const response = await fetch(CRM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('[ASBL CRM] Lead submission response:', data)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit the form. Please try again.')
      }

      setIsSubmitted(true)
      setFormData({
        name: '',
        phone: '',
        email: '',
        budget: '',
        purpose: 'Self Use',
        message: '',
      })
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id={asPopup ? undefined : 'contact'} ref={ref} className={asPopup ? 'bg-[#FFFFFF]' : 'py-24 px-6 bg-[#FFFFFF]'}>
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="font-cormorant italic text-4xl sm:text-5xl md:text-6xl text-[#9D5088] mb-4">
            Are you interested in this Property?
          </h2>
          <p className="text-[#000000] font-montserrat text-sm uppercase tracking-wider">
            Connect with our team for a personalised walkthrough
          </p>
        </div>

        {/* Form */}
        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Name */}
            <div>
              <label className="block font-montserrat text-sm uppercase tracking-wide text-[#9D5088] mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-6 py-3 bg-white border-2 border-[#9D5088] text-[#9D5088] focus:outline-none focus:border-[#AE8F56] placeholder-[#E5E3DF]"
                placeholder="Your name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-montserrat text-sm uppercase tracking-wide text-[#9D5088] mb-2">
                Phone Number
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-3">
                <select
                  name="country_code"
                  value={selectedCountryShort}
                  onChange={(e) => {
                    const selected = countryOptions.find((option) => option.short === e.target.value)
                    setSelectedCountryShort(e.target.value)
                    if (selected) {
                      setSelectedCountryCode(selected.dialCode)
                    }
                  }}
                  className="w-full px-3 py-3 bg-white border-2 border-[#9D5088] text-[#9D5088] focus:outline-none focus:border-[#AE8F56]"
                  aria-label="Country code"
                >
                  {[
                    ...countryOptions,
                    ...(countryOptions.some((option) => option.short === selectedCountryShort)
                      ? []
                      : [{ name: 'Detected', short: selectedCountryShort || 'IN', dialCode: selectedCountryCode }]),
                  ].map((option) => (
                      <option key={`${option.short}-${option.dialCode}`} value={option.short}>
                        {option.dialCode}
                      </option>
                    ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-3 bg-white border-2 border-[#9D5088] text-[#9D5088] focus:outline-none focus:border-[#AE8F56] placeholder-[#E5E3DF]"
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-montserrat text-sm uppercase tracking-wide text-[#9D5088] mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-3 bg-white border-2 border-[#9D5088] text-[#9D5088] focus:outline-none focus:border-[#AE8F56] placeholder-[#E5E3DF]"
                placeholder="your@email.com"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block font-montserrat text-sm uppercase tracking-wide text-[#9D5088] mb-2">
                Budget
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-6 py-3 bg-white border-2 border-[#9D5088] text-[#9D5088] focus:outline-none focus:border-[#AE8F56] placeholder-[#E5E3DF]"
              >
                <option value="">Select budget</option>
                <option value="Below 1.5 Cr">Below 1.5 Cr</option>
                <option value="1.5 Cr - 2 Cr">1.5 Cr - 2 Cr</option>
                <option value="2 Cr - 2.5 Cr">2 Cr - 2.5 Cr</option>
                <option value="Above 2.5 Cr">Above 2.5 Cr</option>
              </select>
            </div>

            {/* Purpose */}
            <div>
              <label className="block font-montserrat text-sm uppercase tracking-wide text-[#9D5088] mb-2">
                Purpose
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-6 py-3 bg-white border-2 border-[#9D5088] text-[#9D5088] focus:outline-none focus:border-[#AE8F56]"
              >
                <option value="Self Use">Self Use</option>
                <option value="Investment">Investment</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block font-montserrat text-sm uppercase tracking-wide text-[#9D5088] mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-6 py-3 bg-white border-2 border-[#9D5088] text-[#9D5088] focus:outline-none focus:border-[#AE8F56] placeholder-[#E5E3DF]"
                placeholder="Tell us what you are looking for"
              />
            </div>

            {errorMessage ? (
              <p className="text-center text-sm text-red-600">{errorMessage}</p>
            ) : null}

            {/* Submit Button */}
            <MotionButton
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#9D5088] text-[#FFFFFF] font-montserrat uppercase tracking-wide hover:bg-[#FDE68A] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Sending...' : 'Request a Callback'}
            </MotionButton>

            {/* Reassurance Text */}
            <p className="text-center text-[#000000] font-lato text-sm">
              No spam. Our team will reach out within 24 hours.
            </p>
          </form>
        ) : (
          <div
            className={`text-center py-12 transition-all duration-1000 ${
              isSubmitted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#AE8F56] mb-6">
              <svg className="w-8 h-8 text-[#9D5088]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-cormorant italic text-3xl text-[#9D5088] mb-2">Thank You!</h3>
            <p className="text-[#000000] font-lato">
              We&apos;ll reach out to you shortly to arrange a personalized walkthrough.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
