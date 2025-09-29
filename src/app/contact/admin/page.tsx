import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

type Answer = {
  id: number
  text: string
  created_at: string
  published: boolean
}

type Question = {
  id: number
  message: string
  created_at: string
  answers: Answer[]
}

async function publishReply(formData: FormData) {
  'use server'

  const text = String(formData.get('text') ?? '').trim()
  const questionIdRaw = formData.get('questionId')

  if (!text || !questionIdRaw) throw new Error('Missing text or questionId')

  const questionId = Number(questionIdRaw)
  if (!Number.isFinite(questionId)) throw new Error('Invalid questionId')

  const sb = supabaseAdmin()
  const { error } = await sb
    .from('answers')
    .insert({ question_id: questionId, text, published: true })

  if (error) throw new Error(error.message)

  revalidatePath('/contact/admin')
}

export default async function AdminContact() {
  const sb = supabaseAdmin()
  const { data: rows, error } = await sb
    .from('questions')
    .select('id, message, created_at, answers ( id, text, created_at, published )')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold mb-4">Contact Admin</h1>
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    )
  }

  const questions: Question[] | null = rows

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Contact Admin</h1>
        <Link href="/contact" className="text-sm text-gray-600 underline">
          Back to Contact
        </Link>
      </div>

      {!questions?.length && <p className="text-gray-500">No questions yet.</p>}

      <ul className="space-y-6">
        {questions?.map((q) => {
          const a = q.answers?.[0]
          return (
            <li key={q.id} className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">
                {new Date(q.created_at).toLocaleString()}
              </p>
              <p className="mb-3">
                <span className="font-medium">Q:</span> {q.message}
              </p>

              {a ? (
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-sm text-gray-500 mb-1">
                    Answered · {new Date(a.created_at).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">A:</span> {a.text}
                  </p>
                </div>
              ) : (
                <form action={publishReply} className="space-y-2">
                  <textarea
                    name="text"
                    placeholder="Write a reply…"
                    className="w-full h-24 rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    required
                  />
                  <input type="hidden" name="questionId" value={q.id} />
                  <button className="px-4 py-2 rounded-full bg-black text-white hover:opacity-90">
                    Publish reply
                  </button>
                </form>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
