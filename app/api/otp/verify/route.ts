export const runtime = 'nodejs'

type VerifyOtpBody = {
  phone?: string
  code?: string
}

const TWILIO_VERIFY_BASE = 'https://verify.twilio.com/v2'

const getTwilioConfig = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!accountSid || !authToken || !verifyServiceSid) {
    throw new Error('Twilio credentials are missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.')
  }

  return { accountSid, authToken, verifyServiceSid }
}

const isValidE164Phone = (phone: string) => /^\+[1-9]\d{7,14}$/.test(phone)
const isValidCode = (code: string) => /^\d{4,8}$/.test(code)

export async function POST(req: Request) {
  let body: VerifyOtpBody

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const phone = body?.phone?.trim() || ''
  const code = body?.code?.trim() || ''

  if (!isValidE164Phone(phone)) {
    return new Response(JSON.stringify({ error: 'Phone number must be in valid E.164 format.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!isValidCode(code)) {
    return new Response(JSON.stringify({ error: 'OTP code must be 4 to 8 digits.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { accountSid, authToken, verifyServiceSid } = getTwilioConfig()

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const payload = new URLSearchParams({
      To: phone,
      Code: code,
    })

    const response = await fetch(`${TWILIO_VERIFY_BASE}/Services/${verifyServiceSid}/VerificationCheck`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data?.message || 'Failed to verify OTP.' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (data?.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Incorrect or expired OTP.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, status: data?.status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Twilio verify OTP error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message || 'Failed to verify OTP.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
