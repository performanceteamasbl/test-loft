import { createHash } from 'node:crypto'

export const runtime = 'nodejs'

type MetaLeadBody = {
  email?: string
  eventId?: string
}

const toSha256 = (value: string) => createHash('sha256').update(value).digest('hex')

export async function POST(req: Request) {
  let body: MetaLeadBody

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const eventId = body?.eventId?.trim()
  const normalizedEmail = body?.email?.trim().toLowerCase()

  if (!eventId) {
    return new Response(JSON.stringify({ error: 'eventId is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_ACCESS_TOKEN

  if (!pixelId || !accessToken) {
    return new Response(JSON.stringify({ error: 'Meta credentials are missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const user_data: Record<string, string> = {}
  if (normalizedEmail) {
    user_data.em = toSha256(normalizedEmail)
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            {
              event_name: 'Lead_Created',
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              action_source: 'website',
              user_data,
            },
          ],
        }),
      }
    )

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.ok ? 200 : response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Meta CAPI error:', error)
    return new Response(JSON.stringify({ error: 'Failed to send event to Meta CAPI.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
