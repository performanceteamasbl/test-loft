export const openInterestFormPopup = (): void => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('open-interest-form-popup'))
}
