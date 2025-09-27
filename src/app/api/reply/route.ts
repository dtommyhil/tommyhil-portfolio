// src/app/api/reply/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  let questionId = ''
  let text = ''
  let adminKey = ''

  const ctype = req.headers.get('content-type') || ''
  if (ctype.includes('application/json')) {
    const body = await req.json()
    questionId = String(body.questionId || '')
    text = String(body.text || '')
    adminKey = String(body.adminKey || '')
  } else {
    const form = await req.formData()
    questionId = String(form.get('questionId') || '')
    text = String(form.get('text') || '')
    adminKey = String(form.get('adminKey') || '')
  }

  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  if (!questionId || !text.trim()) {
    return NextResponse.json({ ok: false, error: 'missing inputs' }, { status: 400 })
  }

  const sb = supabaseAdmin()
  const { error } = await sb
    .from('answers')
    .upsert({ question_id: questionId, text, published: true })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
