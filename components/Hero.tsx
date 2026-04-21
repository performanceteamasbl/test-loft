'use client'

import { useEffect, useState } from 'react'
import { MotionButton } from '@/components/ui/hover-effects'
import { openInterestFormPopup } from '@/lib/popup'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-start justify-center overflow-hidden pt-20">
      {/* Hero Background Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#9D5088] to-[#9D5088] flex items-center justify-center">
        <div className="w-full h-full bg-gradient-to-b from-[#9D5088]/40 via-[#9D5088]/60 to-[#9D5088] flex flex-col items-center justify-center border-2 border-dashed border-[#AE8F56]/30">
          <img
            src="https://images.asbl.in/img?u=https://media.asbl.in/Loft/Web/landing/q-30/latestLandingBgWeb.png&w=1900&h=1080&fit=cover&fmt=webp&v=2&p=loft&m=160&pos=Top-right"
            alt="ASBL Loft"
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="max-w-4xl text-left">
        {/* Badge */}
        <div
          className={`inline-block mb-8 border border-[#AE8F56] px-6 py-2 text-[#AE8F56] text-xs font-montserrat uppercase tracking-widest transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          Exclusive 3BHKs · G+45 Floors
        </div>

        {/* Main Headline */}
        <h1
          className={`font-cormorant italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#FFFFFF] mb-6 leading-tight transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          In Financial District, Gachibowli
        </h1>

        {/* Subheading */}
        <p
          className={`text-[#FFFFFF] font-montserrat text-sm md:text-base uppercase tracking-widest mb-8 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          1,695 sq. ft · Starting ₹1.94 Cr (All Inclusive + GST)
        </p>

        {/* CTAs */}
        <div
          className={`flex flex-col sm:flex-row gap-4 sm:gap-6 justify-start mb-16 transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <MotionButton
            data-popup-ignore="true"
            onClick={() => openInterestFormPopup({ sourceText: 'Book a Site Visit' })}
            className="w-full sm:w-auto px-6 sm:px-10 py-4 bg-[#FDE68A] text-[#854D0E] font-montserrat uppercase tracking-wide hover:bg-[#FDE68A] transition-all duration-300 hover:shadow-lg hover:shadow-[#AE8F56]/20"
          >
            Book a Site Visit
          </MotionButton>
          <MotionButton
            data-popup-ignore="true"
            onClick={() => openInterestFormPopup({ sourceText: 'Download Brochure' })}
            className="w-full sm:w-auto px-6 sm:px-10 py-4 border-2 border-[#FDE68A] text-[#FDE68A] font-montserrat uppercase tracking-wide hover:bg-[#AE8F56]/10 transition-all duration-300"
          >
            Download Brochure
          </MotionButton>
        </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-scroll text-[#FFFFFF] text-center">
          <p className="text-xs uppercase font-montserrat tracking-widest mb-3">Scroll</p>
          <svg
            className="w-5 h-5 mx-auto animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
