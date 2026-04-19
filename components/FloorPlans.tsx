'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import plan1695Image from '../assets/1695.webp'
import plan1870Image from '../assets/1870.webp'
import { MotionButton, MotionCard } from '@/components/ui/hover-effects'
import { openInterestFormPopup } from '@/lib/popup'

export default function FloorPlans() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
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
  }, [])

  return (
    <section id="floor-plans" ref={ref} className="py-20 md:py-24 px-4 sm:px-6 bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-16 text-center">
          <h2
            className={`font-cormorant italic text-4xl sm:text-5xl md:text-6xl text-[#000000] mb-4 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Thoughtfully Designed 3BHK Layouts
          </h2>
          <p
            className={`text-[#000000] font-lato text-lg leading-relaxed max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Each residence spans 1,695 or 1,870 sq. ft., featuring expansive rooms and ASBL&apos;s signature Outdoor Living balcony
          </p>
        </div>

        {/* Floor Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {[
            { type: 'Type A', size: '1,695 sq. ft.', delay: 'delay-300', image: plan1695Image },
            { type: 'Type B', size: '1,870 sq. ft.', delay: 'delay-500', image: plan1870Image },
          ].map((plan, idx) => (
            <MotionCard
              key={idx}
              className={`group cursor-pointer transition-all duration-1000 ${
                isVisible ? `opacity-100 translate-y-0 ${plan.delay}` : 'opacity-0 translate-y-10'
              }`}
            >
              {/* Image Placeholder */}
              <div className="h-64 sm:h-80 md:h-96 bg-[#ffffff] border-2 border-dashed border-[#AE8F56]/30 flex items-center justify-center mb-6 group-hover:border-[#AE8F56]/60 transition-colors duration-300">
                <Image src={plan.image} alt={plan.type} className="h-full w-full object-cover" />
              </div>

              {/* Plan Info */}
              <div className="text-center">
                <h3 className="font-montserrat uppercase text-[#AE8F56] text-sm tracking-wide mb-2">
                  {plan.type}
                </h3>
                <p className="font-cormorant italic text-2xl text-[#000000]">{plan.size}</p>
              </div>
            </MotionCard>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <MotionButton onClick={openInterestFormPopup} className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 border-2 border-[#AE8F56] text-[#AE8F56] font-montserrat uppercase tracking-wide hover:bg-[#AE8F56]/10 transition-all duration-300">
            <span>Explore All Plans</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </MotionButton>
        </div>
      </div>
    </section>
  )
}
