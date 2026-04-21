export type InterestFormPopupDetail = {
  sourceText?: string
}

export const openInterestFormPopup = (detail?: InterestFormPopupDetail): void => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<InterestFormPopupDetail>('open-interest-form-popup', { detail }))
}
