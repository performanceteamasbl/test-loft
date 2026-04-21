'use client'

import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MotionButton } from '@/components/ui/hover-effects'
import { trackEvent } from '@/lib/fpixel'
import { pushGoogleGenerateLead } from '@/lib/google-ads'
import { buildMetaLeadPayload, getMetaBrowserTracking } from '@/lib/meta-tracking'

type FormState = {
  name: string
  phone: string
  budget: string
  purpose: 'Self Use' | 'Investment'
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
  state: string
  country: string
  zip: string
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

const createEventId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export default function InterestForm({ asPopup = false }: InterestFormProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [otpErrorMessage, setOtpErrorMessage] = useState('')
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStepActive, setOtpStepActive] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [formData, setFormData] = useState<FormState>({
    name: '',
    phone: '',
    budget: '',
    purpose: 'Self Use',
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
    state: '',
    country: '',
    zip: '',
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
    const browserTracking = getMetaBrowserTracking()
    const utm_source = browserTracking.utm_source
    const utm_medium = browserTracking.utm_medium
    const utm_campaign = browserTracking.utm_campaign
    const utm_content = browserTracking.utm_content
    const utm_term = browserTracking.utm_term
    const page_url = browserTracking.eventSourceUrl || window.location.href
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
          state: data?.region || data?.region_code || '',
          country: data?.country_name || '',
          zip: data?.postal || '',
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

  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendCooldown])

  const effectiveCountryCode = selectedCountryCode || geoData.country_code || DEFAULT_COUNTRY_CODE
  const phoneWithCountryCode = formatPhoneWithCountryCode(formData.phone, effectiveCountryCode)
  const selectedCountryName =
    countryOptions.find((option) => option.short === selectedCountryShort)?.name || geoData.country || ''
  const textInputClass = asPopup
    ? 'w-full px-0 py-2.5 bg-transparent border-0 border-b border-[#C7C7C7] text-[#3C3C3C] text-[18px] focus:outline-none focus:border-[#9D5088] placeholder-[#8F8F8F]'
    : 'w-full px-3 py-2 bg-white border-2 border-[#9D5088] text-[#9D5088] text-sm focus:outline-none focus:border-[#AE8F56] placeholder-[#E5E3DF]'
  const selectClass = asPopup
    ? 'w-full px-0 py-2.5 bg-transparent border-0 border-b border-[#C7C7C7] text-[#3C3C3C] text-[18px] focus:outline-none focus:border-[#9D5088]'
    : 'w-full px-3 py-2 bg-white border-2 border-[#9D5088] text-[#9D5088] text-sm focus:outline-none focus:border-[#AE8F56]'
  const labelClass = asPopup
    ? 'sr-only'
    : 'block font-montserrat text-xs uppercase tracking-wide text-[#9D5088] mb-1'
  const formSpacingClass = asPopup ? 'space-y-4' : 'space-y-3'

  const resetOtpState = () => {
    setOtpStepActive(false)
    setOtpSent(false)
    setOtpCode('')
    setResendCooldown(0)
    setOtpErrorMessage('')
    setOtpSuccessMessage('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'phone' && value !== formData.phone) {
      resetOtpState()
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const requestOtp = async () => {
    if (!formData.phone.trim()) {
      setOtpErrorMessage('Enter phone number before requesting OTP.')
      setOtpSuccessMessage('')
      return
    }

    setIsSendingOtp(true)
    setOtpErrorMessage('')
    setOtpSuccessMessage('')

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneWithCountryCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to send OTP. Please try again.')
      }

      setOtpSent(true)
      setOtpStepActive(true)
      setResendCooldown(30)
      setOtpSuccessMessage('OTP sent successfully.')
    } catch (error) {
      setOtpErrorMessage((error as Error).message)
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleStartOtpFlow = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.budget.trim()) {
      setOtpErrorMessage('Please complete required details before requesting OTP.')
      setOtpSuccessMessage('')
      return
    }

    await requestOtp()
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    await requestOtp()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nativeSubmitEvent = e.nativeEvent as SubmitEvent
    const submitter = nativeSubmitEvent.submitter as HTMLButtonElement | null
    const isTrackedSubmitClick = submitter?.dataset.trackSubmit === 'true'

    if (!isTrackedSubmitClick) {
      return
    }

    if (!otpStepActive || !otpSent) {
      setErrorMessage('Please request OTP before submitting.')
      return
    }

    if (!otpCode.trim()) {
      setErrorMessage('Please enter OTP before submitting.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setOtpErrorMessage('')
    setOtpSuccessMessage('')

    try {
      setIsVerifyingOtp(true)
      const verifyResponse = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneWithCountryCode,
          code: otpCode.trim(),
        }),
      })

      const verifyData = await verifyResponse.json()
      if (!verifyResponse.ok) {
        throw new Error(verifyData?.error || 'Unable to verify OTP. Please try again.')
      }
      setOtpSuccessMessage('Phone number verified successfully.')

      const { first_name, last_name } = splitFullName(formData.name)
      const phone = phoneWithCountryCode
      const eventId = createEventId()

      const payload = {
        name: formData.name.trim(),
        first_name,
        last_name,
        phone,
        project: PROJECT,
        configuration: CONFIGURATION,
        budget: formData.budget,
        purpose: formData.purpose,
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        utm_content: trackingData.utm_content,
        utm_term: trackingData.utm_term,
        page_url: trackingData.page_url,
        referrer: trackingData.referrer,
        city: geoData.city,
        country: selectedCountryName,
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

      const leadEventParams = {
        content_name: 'Website Lead',
        value: 1,
        currency: 'INR',
        project: PROJECT,
        configuration: CONFIGURATION,
        budget: formData.budget,
        purpose: formData.purpose,
        source: trackingData.source,
        page_url: trackingData.page_url,
        referrer: trackingData.referrer,
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        utm_content: trackingData.utm_content,
        utm_term: trackingData.utm_term,
      }

      trackEvent('LEAD_CREATED', leadEventParams, eventId)

      pushGoogleGenerateLead({
        phoneNumber: phone,
        firstName: first_name,
        lastName: last_name,
        city: geoData.city,
        region: geoData.state,
        postalCode: geoData.zip,
        country: selectedCountryShort,
      })

      void fetch('/api/meta-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          buildMetaLeadPayload({
            eventId,
            tracking: getMetaBrowserTracking(),
            user: {
              name: formData.name,
              phone: formData.phone,
              countryCode: effectiveCountryCode,
              city: geoData.city,
              state: geoData.state,
              country: selectedCountryName,
              zip: geoData.zip,
            },
          })
        ),
      }).catch((metaError) => {
        console.error('[Meta CAPI] Lead event failed:', metaError)
      })

      setIsSubmitted(true)
      setFormData({
        name: '',
        phone: '',
        budget: '',
        purpose: 'Self Use',
      })
      resetOtpState()
    } catch (error) {
      const message = (error as Error).message
      if (message.toLowerCase().includes('otp') || message.toLowerCase().includes('verify')) {
        setOtpErrorMessage(message)
      } else {
        setErrorMessage(message)
      }
    } finally {
      setIsVerifyingOtp(false)
      setIsLoading(false)
    }
  }

  return (
    <section id={asPopup ? undefined : 'contact'} ref={ref} className={asPopup ? 'bg-transparent' : 'py-10 px-4 sm:px-4 bg-[#FFFFFF]'}>
      <div className={asPopup ? 'w-full' : 'max-w-md mx-auto'}>
        {/* Heading */}
        {!asPopup ? (
          <div
            className={`text-center mb-6 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="font-cormorant italic text-2xl sm:text-3xl md:text-4xl text-[#9D5088] mb-2">
              Are you interested in this Property?
            </h2>
            <p className="text-[#000000] font-montserrat text-xs uppercase tracking-wide">
              Connect with our team for a personalised walkthrough
            </p>
          </div>
        ) : null}

        {/* Form */}
        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className={`${formSpacingClass} transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {!otpStepActive ? (
                <motion.div
                  key="details-step"
                  initial={{ x: 0, opacity: 1 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -60, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className={formSpacingClass}
                >
                  {/* Name */}
                  <div>
                    <label className={labelClass}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={textInputClass}
                      placeholder="Your name"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={labelClass}>
                      Phone Number
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-3">
                      <select
                        name="country_code"
                        value={selectedCountryShort}
                        onChange={(e) => {
                          const selected = countryOptions.find((option) => option.short === e.target.value)
                          setSelectedCountryShort(e.target.value)
                          if (selected) {
                            setSelectedCountryCode(selected.dialCode)
                          }
                          resetOtpState()
                        }}
                        className={selectClass}
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
                        className={textInputClass}
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className={labelClass}>
                      Budget
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className={selectClass}
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
                    <label className={labelClass}>
                      Purpose
                    </label>
                    <select
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="Self Use">Self Use</option>
                      <option value="Investment">Investment</option>
                    </select>
                  </div>

                  <MotionButton
                    type="button"
                    data-popup-ignore="true"
                    onClick={handleStartOtpFlow}
                    disabled={isSendingOtp}
                    className={asPopup
                      ? 'w-full rounded-full bg-[#9D5088] py-3 text-[#FFFFFF] font-montserrat text-lg tracking-wide hover:bg-[#8B4678] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70'
                      : 'w-full py-2.5 bg-[#9D5088] text-[#FFFFFF] font-montserrat text-xs uppercase tracking-wide hover:bg-[#AE8F56] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70'}
                  >
                    {isSendingOtp ? 'Sending OTP...' : 'Get OTP'}
                  </MotionButton>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -60, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className={asPopup ? 'space-y-4' : 'space-y-2.5'}
                >
                  <p className={asPopup ? 'text-sm text-[#7A7A7A] font-lato' : 'text-xs text-[#000000] font-lato'}>
                    OTP sent to {phoneWithCountryCode}. Verify to enable submit.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))
                        setOtpErrorMessage('')
                      }}
                      disabled={!otpSent}
                      className={textInputClass}
                      placeholder={otpSent ? 'Enter OTP' : 'Send OTP to continue'}
                      aria-label="OTP code"
                    />
                    <div className="flex gap-2">
                      <MotionButton
                        type="button"
                        data-popup-ignore="true"
                        onClick={handleResendOtp}
                        disabled={isSendingOtp || resendCooldown > 0}
                        className={asPopup
                          ? 'px-4 py-2 rounded-full bg-[#9D5088] text-[#FFFFFF] font-montserrat text-xs tracking-wide hover:bg-[#8B4678] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                          : 'px-3 py-2 bg-[#9D5088] text-[#FFFFFF] font-montserrat text-[11px] uppercase tracking-wide hover:bg-[#AE8F56] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : isSendingOtp ? 'Sending...' : 'Resend OTP'}
                      </MotionButton>
                    </div>
                  </div>

                  <MotionButton
                    type="submit"
                    data-track-submit="true"
                    disabled={!otpCode.trim() || isLoading || isVerifyingOtp}
                    className={asPopup
                      ? 'w-full rounded-full bg-[#9D5088] py-3 text-[#FFFFFF] font-montserrat text-lg tracking-wide hover:bg-[#8B4678] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70'
                      : 'w-full py-2.5 bg-[#9D5088] text-[#FFFFFF] font-montserrat text-xs uppercase tracking-wide hover:bg-[#FDE68A] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70'}
                  >
                    {isVerifyingOtp ? 'Verifying OTP...' : isLoading ? 'Sending...' : 'Submit'}
                  </MotionButton>
                </motion.div>
              )}
            </AnimatePresence>

            {errorMessage ? (
              <p className="text-center text-sm text-red-600">{errorMessage}</p>
            ) : null}

            {otpSuccessMessage ? (
              <p className="text-sm text-green-700">{otpSuccessMessage}</p>
            ) : null}
            {otpErrorMessage ? (
              <p className="text-sm text-red-600">{otpErrorMessage}</p>
            ) : null}

            {/* Reassurance Text */}
            <p className={asPopup ? 'text-left text-[#868686] font-lato text-sm' : 'text-center text-[#000000] font-lato text-xs'}>
              No spam. Our team will reach out within 24 hours.
            </p>
          </form>
        ) : (
          <div
            className={`text-center py-8 transition-all duration-1000 ${
              isSubmitted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#AE8F56] mb-4">
              <svg className="w-6 h-6 text-[#9D5088]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-cormorant italic text-2xl text-[#9D5088] mb-1">Thank You!</h3>
            <p className="text-[#000000] font-lato text-sm">
              We&apos;ll reach out to you shortly to arrange a personalized walkthrough.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
