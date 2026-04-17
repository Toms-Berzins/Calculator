import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const verifyUrl = process.env.CAPTCHA_VERIFY_URL
  const sitekey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY
  const secret = process.env.CAPTCHA_SECRET_KEY

  if (!verifyUrl || !sitekey || !secret) {
    console.error('[captcha] Missing env vars:', {
      verifyUrl: !!verifyUrl,
      sitekey: !!sitekey,
      secret: !!secret,
    })
    return NextResponse.json({ success: false, error: 'misconfigured' }, { status: 500 })
  }

  const { token } = await req.json()

  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-client-ip') ??
    '0.0.0.0'

  const userAgent = req.headers.get('user-agent') ?? ''

  try {
    const res = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sitekey,
        secret,
        client_ip: clientIp,
        client_token: token ?? '',
        client_user_agent: userAgent,
      }),
    })

    const data = await res.json()
    console.log('[captcha] verify response:', data)

    // train: true means validation was bypassed — treat as failure
    if (data.success === true && data.train !== true) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, data }, { status: 400 })
  } catch (err) {
    console.error('[captcha] fetch error:', err)
    return NextResponse.json({ success: false, error: 'fetch_failed' }, { status: 500 })
  }
}
