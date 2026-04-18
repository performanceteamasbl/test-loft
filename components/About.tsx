'use client'

import { useEffect, useState, useRef } from 'react'

export default function About() {
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
    <section id="about" ref={ref} className="py-24 px-6 bg-[#0F1520] relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="mb-16 flex items-start gap-8">
          <div className="text-[#706E6B] font-montserrat text-sm uppercase tracking-wider opacity-60">
            01 / ABOUT
          </div>
          <div className="flex-1">
            <h2
              className={`font-cormorant italic text-5xl md:text-6xl text-[#FEFBF4] mb-8 transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              About ASBL Loft
            </h2>

            {/* Content */}
            <div className="space-y-6 font-lato text-[#706E6B] text-lg leading-relaxed mb-12">
              <p
                className={`transition-all duration-1000 delay-200 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              >
                ASBL Loft is a premium 3BHK residential project situated in the heart of Financial District, Nanakramguda, Gachibowli. Designed with meticulous attention to detail, this G+45 tower offers 1,695 to 1,870 sq. ft. of thoughtfully laid-out living spaces, each featuring ASBL&apos;s signature Outdoor Living balcony—your personal oasis in the sky.
              </p>
              <p
                className={`transition-all duration-1000 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              >
                Located in a thriving IT hub with proximity to Amazon, Microsoft, Wipro, and other corporate giants, ASBL Loft is future-ready. Seamless connectivity to ORR, ISB Road, and Wipro Circle ensures you&apos;re always connected. This is more than a home—it&apos;s a statement of refined living.
              </p>
            </div>

            {/* Image Placeholder */}
            <div
              className={`mb-12 h-96 bg-gradient-to-br from-[#1E1E1E] to-[#0F1520] border-2 border-dashed border-[#AE8F56]/30 flex items-center justify-center transition-all duration-1000 delay-400 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <p className="text-[#AE8F56]/60 italic font-cormorant text-lg">Project Overview / Rendered Exterior</p>
            </div>

            {/* Key Stats */}
            <div className="flex flex-wrap gap-4 text-center md:text-left border-t border-[#AE8F56]/20 pt-8">
              {[
                { label: 'G+45 Floors', delay: 'delay-500' },
                { label: '1695–1870 sq. ft', delay: 'delay-600' },
                { label: 'Dec 2026 Possession', delay: 'delay-700' },
                { label: 'RERA Approved', delay: 'delay-800' },
              ].map((stat, idx) => (
                <div key={idx} className={`flex-1 min-w-[150px] transition-all duration-1000 ${isVisible ? `opacity-100 translate-y-0 ${stat.delay}` : 'opacity-0 translate-y-5'}`}>
                  <p className="font-montserrat text-sm uppercase tracking-wider text-[#AE8F56] mb-2">·</p>
                  <p className="font-lato text-[#FEFBF4]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
