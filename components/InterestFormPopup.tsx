'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import InterestForm from '@/components/InterestForm'
import loftLogoForm from '../assets/Loft-logo-form.webp'

const getPopupTitleBySource = (sourceText?: string) => {
  const source = (sourceText || '').toLowerCase().trim()
  if (!source) return 'Download Brochure'

  if (source.includes('site visit')) return 'Book Site Visit'
  if (source.includes('floor')) return 'Get Floor Plans'
  if (source.includes('payment')) return 'Get Payment Plan'
  if (source.includes('amenit')) return 'Explore Amenities'
  if (source.includes('price')) return 'Get Price Details'
  if (source.includes('brochure')) return 'Download Brochure'

  return sourceText || 'Download Brochure'
}

export default function InterestFormPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [popupTitle, setPopupTitle] = useState('Download Brochure')

  useEffect(() => {
    const openPopup = (event?: Event) => {
      const customEvent = event as CustomEvent<{ sourceText?: string }> | undefined
      setPopupTitle(getPopupTitleBySource(customEvent?.detail?.sourceText))
      setIsOpen(true)
    }

    const timer = setTimeout(() => {
      openPopup()
    }, 5000)

    window.addEventListener('open-interest-form-popup', openPopup as EventListener)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('open-interest-form-popup', openPopup as EventListener)
    }
  }, [])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed flex justify-center items-center inset-0 z-[100] overflow-y-auto bg-black/60 p-3 sm:p-4 md:p-8">
      <div className="relative mx-auto w-full max-w-6xl rounded-lg bg-[#F6F6F6] p-5 sm:p-7 md:p-10">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          data-popup-ignore="true"
          className="absolute right-4 top-3 text-4xl leading-none text-[#2F2F2F] hover:text-[#9D5088]"
          aria-label="Close popup"
        >
          ×
        </button>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-10">
          <div className="flex flex-col justify-center gap-4" >
            <h2 className="font-cormorant text-4xl leading-[1.15] text-[#2E2F35] sm:text-5xl">
              {popupTitle}
            </h2>
            <div className="mt-8">
              <Image
                src={loftLogoForm}
                alt="Loft Logo"
                className="h-auto w-44 object-contain"
                priority
              />
            </div>
          </div>

          <div className="pt-8 md:pt-10">
            <InterestForm asPopup />
          </div>
        </div>
      </div>
    </div>
  )
}
