'use client'

import { useCallback } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import PaymentPlan from '@/components/PaymentPlan'
import FloorPlans from '@/components/FloorPlans'
import Location from '@/components/Location'
import Amenities from '@/components/Amenities'
import InterestForm from '@/components/InterestForm'
import InterestFormPopup from '@/components/InterestFormPopup'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export default function Home() {
  const handleOpenPopupFromButtons = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null
    if (!target) return

    const trigger = target.closest('button') as HTMLButtonElement | null
    if (!trigger) return

    if (trigger.dataset.popupIgnore === 'true') return
    if (trigger.type === 'submit') return
    if (trigger.closest('form')) return

    window.dispatchEvent(new Event('open-interest-form-popup'))
  }, [])

  return (
    <main onClickCapture={handleOpenPopupFromButtons} className="min-h-screen bg-[#FFFFFF] text-[#FFFFFF]">
      <InterestFormPopup />
      <Header />
      <Hero />
      <About />
      <PaymentPlan />
      <FloorPlans />
      <Location />
      <Amenities />
      <InterestForm />
      <FAQ />
      <Footer />
    </main>
  )
}
