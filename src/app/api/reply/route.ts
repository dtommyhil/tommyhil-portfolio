import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// --- Email sender ---
const resend = new Resend(process.env.RESEND_API_KEY)

// --- Validation schema ---
const AskSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(80, 'Name is too long'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message is too short').max(2000, 'Message is too long'),
  topic: z.string().max(60, 'Topic is too long').optional(),
  // Honeypot: bots will fill this, humans won’t (keep it empty)
  website: z.string().max(0).optional(),
})

type AskPayload = z.infer<typeof AskSchema>

function clientIp(req: Request) {
  const xff = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
  return xff || 'unknown'
}

// Tiny in-memory, per-minute limiter (OK for small sites)
function rateKey(ip: string) {
  const minute = Math.floor(Date.now() / 60000)
  return `${ip}:${minute}`
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}))
    const parsed = AskSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'invalid_input', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { name, email, message, topic } = parsed.data as AskPayload

    // rate limit (lightweight)
    const ip = clientIp(req)
    ;(global as any).__ASK__ = (global as any).__ASK__ || new Map<string, number>()
    const store: Map<string, number> = (global as any).__ASK__
    const key = rateKey(ip)
    const count = (store.get(key) ?? 0) + 1
    store.set(key, count)
    if (count > 5) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
    }

    const to = process.env.CONTACT_TO
    const from = process.env.CONTACT_FROM || 'no-reply@resend.dev'
    if (!to || !process.env.RESEND_API_KEY) {
      return NextResponse.json({ ok: false, error: 'server_not_configured' }, { status: 500 })
    }

    const subject = topic ? `[Ask] ${topic} — from ${name}` : `[Ask] from ${name}`

    await resend.emails.send({
      from,
      to,
      subject,
      reply_to: email,
      text: `From: ${name} <${email}>\nTopic: ${topic || '-'}\nIP: ${ip}\n\n${message}`,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    )
  }
}
