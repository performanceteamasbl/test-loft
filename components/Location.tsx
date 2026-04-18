'use client'

import { useEffect, useState, useRef } from 'react'

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
    { title: 'Favorite of IT Giants', desc: 'Proximity to Amazon, Microsoft, Wipro & other corporate hubs' },
    { title: 'Connectivity Like Never Before', desc: 'Easy access to ORR, ISB Road, and Wipro Circle' },
    { title: 'Great Infrastructure', desc: 'World-class amenities and seamless urban connectivity' },
    { title: 'Best Investment Opportunity', desc: 'High appreciation potential in the prime Financial District' },
  ]

  return (
    <section id="location" ref={ref} className="py-24 px-6 bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto">
        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 items-start">
          {/* Text Content */}
          <div>
            <h2
              className={`font-cormorant italic text-5xl md:text-6xl text-[#000000] mb-6 transition-all duration-1000 ${
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
              className={`text-[#000000] font-lato text-lg leading-relaxed mb-8 transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              Situated in Nanakramguda, Gachibowli, ASBL Loft offers unprecedented connectivity and lifestyle advantages. Seamless access to corporate offices, shopping centers, schools, and healthcare facilities makes this location a perfect choice for discerning buyers.
            </p>
          </div>

          {/* Map Placeholder */}
          <div
            className={`h-96 bg-gradient-to-br from-[#9D5088] to-[#9D5088] border-2 border-dashed border-[#AE8F56]/30 flex items-center justify-center transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <p className="text-[#AE8F56]/60 italic font-cormorant text-lg">Location Map / Aerial View</p>
          </div>
        </div>

        {/* Why Financial District */}
        <div className="mb-0">
          <h3 className="font-montserrat uppercase text-[#AE8F56] text-sm tracking-wide mb-8 text-center">
            Why Financial District?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`group transition-all duration-1000 ${
                  isVisible ? `opacity-100 translate-y-0 delay-${(idx + 5) * 100}` : 'opacity-0 translate-y-10'
                }`}
              >
                {/* Feature Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-[#9D5088] to-[#9D5088] border border-[#AE8F56]/20 flex items-center justify-center mb-4 group-hover:border-[#AE8F56]/40 transition-colors duration-300">
                  <p className="text-[#AE8F56]/40 italic font-cormorant text-sm">{feature.title}</p>
                </div>
                <h4 className="font-montserrat uppercase text-[#000000] text-sm tracking-wide mb-3">
                  {feature.title}
                </h4>
                <p className="text-[#000000] font-lato text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
