import {
  buildMetaCustomData,
  buildMetaUserData,
  normalizeEventSourceUrl,
  type MetaLeadInput,
} from '@/lib/server/meta-capi'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let body: Partial<MetaLeadInput>

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const eventId = body?.eventId?.trim()

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

  const metaLeadInput: MetaLeadInput = {
    eventId,
    email: body.email,
    name: body.name,
    phone: body.phone,
    city: body.city,
    state: body.state,
    country: body.country,
    zip: body.zip,
    fbp: body.fbp,
    fbc: body.fbc,
    eventSourceUrl: body.eventSourceUrl,
    utm_source: body.utm_source,
    utm_medium: body.utm_medium,
    utm_campaign: body.utm_campaign,
    utm_term: body.utm_term,
    utm_content: body.utm_content,
  }

  const user_data = buildMetaUserData(metaLeadInput, req)
  const custom_data = buildMetaCustomData(metaLeadInput)
  const event_source_url = normalizeEventSourceUrl(metaLeadInput.eventSourceUrl)
  const eventPayload = {
    event_name: 'LEAD_CREATED',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    user_data,
    ...(event_source_url ? { event_source_url } : {}),
    ...(Object.keys(custom_data).length > 0 ? { custom_data } : {}),
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
          data: [eventPayload],
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
