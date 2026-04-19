'use client'

import { useEffect, useState } from 'react'
import InterestForm from '@/components/InterestForm'
import { MotionButton } from '@/components/ui/hover-effects'

export default function InterestFormPopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const openPopup = () => setIsOpen(true)
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 5000)

    window.addEventListener('open-interest-form-popup', openPopup)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('open-interest-form-popup', openPopup)
    }
  }, [])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 p-3 sm:p-4 md:p-8 overflow-y-auto">
      <div className="mx-auto mt-4 sm:mt-8 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-4 md:p-6">
        <div className="mb-2 flex justify-end">
          <MotionButton
            type="button"
            onClick={() => setIsOpen(false)}
            data-popup-ignore="true"
            className="rounded border border-[#9D5088] px-3 py-1 text-sm text-[#9D5088] hover:bg-[#FDE68A]"
            aria-label="Close popup"
          >
            Close
          </MotionButton>
        </div>
        <InterestForm asPopup />
      </div>
    </div>
  )
}
