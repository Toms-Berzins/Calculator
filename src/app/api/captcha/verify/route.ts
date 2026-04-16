import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-client-ip') ??
    '0.0.0.0'

  const userAgent = req.headers.get('user-agent') ?? ''

  const res = await fetch(process.env.CAPTCHA_VERIFY_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sitekey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,
      secret: process.env.CAPTCHA_SECRET_KEY,
      client_ip: clientIp,
      client_token: token ?? '',
      client_user_agent: userAgent,
    }),
  })

  const data = await res.json()

  // train: true means validation was bypassed — treat as failure
  if (data.success === true && data.train !== true) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 400 })
}
