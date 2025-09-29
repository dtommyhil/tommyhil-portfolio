import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const AskSchema = z.object({
  name: z.string().min(2, 'Name too short').max(80),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message too short').max(2000),
})

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

    const { name, email, message } = parsed.data

    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('questions')
      .insert({ name, email, message })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const hasResend = !!process.env.RESEND_API_KEY && !!process.env.CONTACT_TO
    if (hasResend) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.CONTACT_FROM || 'no-reply@resend.dev',
          to: process.env.CONTACT_TO!,
          subject: `New question from ${name}`,
          text: `From: ${name} <${email}>\n\n${message}\n\nQuestion ID: ${data.id}`,
          replyTo: email,
        })
      } catch (e) {
        console.warn('Resend failed, skipping notification:', (e as Error).message)
      }
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    )
  }
}
