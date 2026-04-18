'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import plan1Image from '../assets/plan1.png'
import plan2Image from '../assets/plan2.png'

export default function PaymentPlan() {
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
    <section ref={ref} className="py-24 px-6 bg-[#FFFFFF] relative overflow-hidden">
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-40 h-40 border border-[#AE8F56] rotate-45"></div>
        <div className="absolute bottom-20 left-20 w-60 h-60 border border-[#AE8F56] rotate-12"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Heading */}
        <h2
          className={`font-cormorant italic text-5xl md:text-5xl text-[#9D5088] text-center mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          UNLOCK ₹85000 MONTHLY RENTAL OFFER
        </h2>
        <p className="text-center text-[#000000] font-montserrat text-sm uppercase tracking-wider mb-16">
          Right from the date of first disbursement till December 2026
        </p>

    

        {/* Image Placeholder */}
        <div
          className={` p-4 mb-12 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="flex flex-col md:flex-row justify-center gap-3 h-100">
            <Image
              src={plan1Image}
              alt="Payment Plan before the rental offer"
              className="h-100 w-[30%] object-contain"
            />
            <Image
              src={plan2Image}
              alt="Payment Plan with the rental offer"
              className="h-100 w-[30%] object-contain"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="inline-flex items-center gap-3 text-[#AE8F56] font-montserrat uppercase tracking-wider hover:translate-x-2 transition-all duration-300">
            <span>Explore Payment Structure</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
