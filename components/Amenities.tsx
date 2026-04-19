'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { MotionButton, MotionCard } from '@/components/ui/hover-effects'
import { openInterestFormPopup } from '@/lib/popup'
import clubhouseImage from '../assets/Clubhouse-new.webp'
import poolImage from '../assets/pool.webp'
import gymImage from '../assets/gym.webp'
import coworkingImage from '../assets/cowarking.webp'
import crecheImage from '../assets/crache.webp'
import badmintonImage from '../assets/badminton.webp'
import guestroomImage from '../assets/guestroom.webp'
import yogaImage from '../assets/yoga.webp'
import partyHallImage from '../assets/partyhall.webp'
import practicalLuxuryImage from '../assets/practicalluxury.webp'

export default function Amenities() {
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

  const amenities = [
    { label: 'Clubhouse', image: clubhouseImage },
    { label: 'Swimming Pool', image: poolImage },
    { label: 'Gymnasium', image: gymImage },
    { label: 'Co-working Space', image: coworkingImage },
    { label: 'Creche', image: crecheImage },
    { label: 'Badminton', image: badmintonImage },
    { label: 'Guest Room', image: guestroomImage },
    { label: 'Yoga Deck', image: yogaImage },
    { label: 'Party Hall', image: partyHallImage },
    { label: 'Practical Luxury', image: practicalLuxuryImage },
  ]

  return (
    <section id="amenities" ref={ref} className="py-20 md:py-24 px-4 sm:px-6 bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2
              className={`font-cormorant italic text-4xl sm:text-5xl md:text-6xl text-[#000000] mb-4 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Carefully Curated Lifestyle
          </h2>
          <p
              className={`text-[#000000] font-lato text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-12 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            With 55,000 sq. ft. clubhouse, 30,000 sq. ft. fitness zone, olympic pool, co-working spaces, pharmacy, and more—your lifestyle is at your doorstep.
          </p>
        </div>

        {/* Image Placeholder */}
        <div
          className={`h-64 sm:h-80 md:h-96 bg-gradient-to-br from-[#9D5088] to-[#9D5088] border-2 border-dashed border-[#AE8F56]/30 flex items-center justify-center mb-16 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <Image src={clubhouseImage} alt="Clubhouse / Amenities Aerial View" className="h-full w-full object-cover" />
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-12">
          {amenities.map((amenity, idx) => (
            <MotionCard
              key={idx}
              className={`group flex flex-col items-center gap-3 p-6 bg-[#FFFFFF] border border-[#AE8F56]/20 hover:border-[#AE8F56]/60 transition-all duration-300 text-center cursor-pointer transform duration-1000 ${
                isVisible ? `opacity-100 translate-y-0 delay-${(idx + 4) * 50}` : 'opacity-0 translate-y-10'
              }`}
            >
              <Image src={amenity.image} alt={amenity.label} className="h-28 w-full object-cover" />
              <p className="font-montserrat text-sm uppercase tracking-wide text-[#000000] group-hover:text-[#AE8F56] transition-colors">
                {amenity.label}
              </p>
            </MotionCard>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <MotionButton onClick={openInterestFormPopup} className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 border-2 border-[#AE8F56] text-[#AE8F56] font-montserrat uppercase tracking-wide hover:bg-[#AE8F56]/10 transition-all duration-300">
            <span>Explore Amenities</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </MotionButton>
        </div>
      </div>
    </section>
  )
}
