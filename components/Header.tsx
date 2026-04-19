'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { MotionButton } from '@/components/ui/hover-effects'
import { openInterestFormPopup } from '@/lib/popup'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: '#about', label: 'About' },
    { href: '#location', label: 'Location' },
    { href: '#floor-plans', label: 'Floor Plans' },
    { href: '#amenities', label: 'Amenities' },
    { href: '#contact', label: 'Contact' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const closeOnResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', closeOnResize)
    return () => window.removeEventListener('resize', closeOnResize)
  }, [isMenuOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FFFFFF]/95 backdrop-blur-sm border-b border-[#AE8F56]/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="font-cormorant text-xl sm:text-2xl font-semibold tracking-wider text-[#AE8F56] italic">
          ASBL LOFT
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`${isScrolled ? 'text-[#000000]' : 'text-[#FFFFFF]'} hover:text-[#AE8F56] transition-colors text-sm font-montserrat uppercase tracking-wide`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:block">
          <MotionButton onClick={openInterestFormPopup} className="px-6 py-2 border-2 border-[#AE8F56] text-[#AE8F56] hover:bg-[#AE8F56] hover:text-[#9D5088] transition-all duration-300 text-sm font-montserrat uppercase tracking-wide">
            Book a Site Visit
          </MotionButton>
        </div>

        <button
          type="button"
          data-popup-ignore="true"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`lg:hidden inline-flex items-center justify-center rounded border px-3 py-2 transition-colors ${isScrolled ? 'border-[#AE8F56] text-[#000000]' : 'border-[#FFFFFF]/60 text-[#FFFFFF]'}`}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[#AE8F56]/20 bg-[#FFFFFF]/95 backdrop-blur-sm"
          >
            <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[#000000] hover:text-[#AE8F56] transition-colors text-sm font-montserrat uppercase tracking-wide"
                >
                  {item.label}
                </Link>
              ))}
              <MotionButton
                onClick={() => {
                  setIsMenuOpen(false)
                  openInterestFormPopup()
                }}
                className="mt-2 w-full px-6 py-2 border-2 border-[#AE8F56] text-[#AE8F56] hover:bg-[#AE8F56] hover:text-[#9D5088] transition-all duration-300 text-sm font-montserrat uppercase tracking-wide"
              >
                Book a Site Visit
              </MotionButton>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
