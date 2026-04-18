'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0F1520]/95 backdrop-blur-sm border-b border-[#AE8F56]/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo */}
        <div className="font-cormorant text-2xl font-semibold tracking-wider text-[#AE8F56] italic">
          ASBL LOFT
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#about"
            className="text-[#FEFBF4] hover:text-[#AE8F56] transition-colors text-sm font-montserrat uppercase tracking-wide"
          >
            About
          </Link>
          <Link
            href="#location"
            className="text-[#FEFBF4] hover:text-[#AE8F56] transition-colors text-sm font-montserrat uppercase tracking-wide"
          >
            Location
          </Link>
          <Link
            href="#floor-plans"
            className="text-[#FEFBF4] hover:text-[#AE8F56] transition-colors text-sm font-montserrat uppercase tracking-wide"
          >
            Floor Plans
          </Link>
          <Link
            href="#amenities"
            className="text-[#FEFBF4] hover:text-[#AE8F56] transition-colors text-sm font-montserrat uppercase tracking-wide"
          >
            Amenities
          </Link>
          <Link
            href="#contact"
            className="text-[#FEFBF4] hover:text-[#AE8F56] transition-colors text-sm font-montserrat uppercase tracking-wide"
          >
            Contact
          </Link>
        </nav>

        {/* CTA Button */}
        <button className="px-6 py-2 border-2 border-[#AE8F56] text-[#AE8F56] hover:bg-[#AE8F56] hover:text-[#0F1520] transition-all duration-300 text-sm font-montserrat uppercase tracking-wide">
          Book a Site Visit
        </button>
      </div>
    </header>
  )
}
