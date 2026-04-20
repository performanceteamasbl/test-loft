'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { MotionCard } from '@/components/ui/hover-effects'
import loftlocation from '../assets/Loft-Nearby-Map2.webp'
import why1Image from '../assets/Why-1.webp'
import why2Image from '../assets/Why-2.webp'
import why3Image from '../assets/Why-3.webp'
import why4Image from '../assets/Why-4.webp'

export default function Location() {
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

  const features = [
    { title: 'Favorite of IT Giants', desc: 'Proximity to Amazon, Microsoft, Wipro & other corporate hubs', image: why1Image },
    { title: 'Connectivity Like Never Before', desc: 'Easy access to ORR, ISB Road, and Wipro Circle', image: why2Image },
    { title: 'Great Infrastructure', desc: 'World-class amenities and seamless urban connectivity', image: why3Image },
    { title: 'Best Investment Opportunity', desc: 'High appreciation potential in the prime Financial District', image: why4Image },
  ]

  return (
    <section id="location" ref={ref} className="py-20 md:py-24 px-4 sm:px-6 bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto">
        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16 items-start">
          {/* Text Content */}
          <div>
            <h2
              className={`font-cormorant italic text-4xl sm:text-5xl md:text-6xl text-[#000000] mb-6 transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              Prime Location, Limitless Possibilities
            </h2>
            <h3
              className={`font-montserrat uppercase text-[#AE8F56] text-sm tracking-wide mb-6 transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              Premium 3BHK flats in the heart of Financial District
            </h3>
            <p
              className={`text-[#000000] font-lato text-base sm:text-lg leading-relaxed mb-8 transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              Situated in Nanakramguda, Gachibowli, ASBL Loft offers unprecedented connectivity and lifestyle advantages. Seamless access to corporate offices, shopping centers, schools, and healthcare facilities makes this location a perfect choice for discerning buyers.
            </p>
          </div>

          {/* Map Placeholder */}
          <div className="h-full w-full">
            <Image src={loftlocation} alt="Loft Location" className="h-auto w-full object-contain" />
          </div>
        </div>

        {/* Why Financial District */}
        <div className="mb-0">
          <h3 className="font-montserrat uppercase text-[#AE8F56] text-sm tracking-wide mb-8 text-center">
            Why Financial District?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <MotionCard
                key={idx}
                className={`group transition-all duration-1000 ${
                  isVisible ? `opacity-100 translate-y-0 delay-${(idx + 5) * 100}` : 'opacity-0 translate-y-10'
                }`}
              >
                {/* Feature Image Placeholder */}
                <div className="h-48 border border-[#AE8F56]/20 flex items-center justify-center mb-4 group-hover:border-[#AE8F56]/40 transition-colors duration-300 p-4">
                  <Image src={feature.image} alt={feature.title} className="h-full w-full object-contain" />
                </div>
                <h4 className="font-montserrat uppercase text-[#000000] text-sm tracking-wide mb-3">
                  {feature.title}
                </h4>
                <p className="text-[#000000] font-lato text-sm">{feature.desc}</p>
              </MotionCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
