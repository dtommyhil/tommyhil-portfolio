import Header from '@/components/Header'
import ContactCard from '@/components/ContactCard'
import { FaEnvelope, FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa"
import AskForm from './AskForm'
import { supabaseServer } from '@/lib/supabase-server'

type QuestionObj = { id: string; message: string }
type AnswerRowRaw = {
  id: string
  text: string
  created_at: string
  // some Supabase versions may still return an array; handle both
  question: QuestionObj | QuestionObj[] | null
}
type AnswerView = {
  id: string
  text: string
  created_at: string
  question: QuestionObj | null
}

export default async function ContactPage() {
  const sb = await supabaseServer()

  const { data, error } = await sb
    .from('answers')
    .select(`
      id,
      text,
      created_at,
      question:questions!answers_question_id_fkey ( id, message )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .returns<AnswerRowRaw[]>()

  if (error) console.error(error)

  const answers: AnswerView[] = (data ?? []).map((r) => ({
    id: r.id,
    text: r.text,
    created_at: r.created_at,
    question: Array.isArray(r.question) ? r.question[0] ?? null : r.question ?? null,
  }))

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-2xl mx-auto px-8 py-4">
        <h1 className="text-4xl font-bold mb-3">contact</h1>
        <p className="text-gray-500 mb-8">let&apos;s connect.</p>

        <section className="space-y-4 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ContactCard
              label="Email"
              value="todo1631@colorado.edu"
              href="mailto:todo1631@colorado.edu"
              icon={<FaEnvelope className="h-5 w-5" />}
            />
            <ContactCard
              label="LinkedIn"
              value="in/tommyhildoan"
              href="https://linkedin.com/in/tommyhildoan"
              icon={<FaLinkedin className="h-6 w-6" />}
            />
            <ContactCard
              label="GitHub"
              value="dtommyhil"
              href="https://github.com/dtommyhil"
              icon={<FaGithub className="h-6 w-6" />}
            />
            <ContactCard
              label="Instagram"
              value="@dtommyhil"
              href="https://instagram.com/dtommyhil"
              icon={<FaInstagram className="h-6 w-6" />}
            />
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Ask me anything</h2>
          <AskForm />
        </section>

        <section className="mb-16">
          {!answers.length && <p className="text-gray-500">No replies yet.</p>}

          <div className="space-y-2">
            {answers.map((a) => (
              <div key={a.id} className="rounded-2xl border border-gray-200 p-4">
                <p className="font-semibold text-gray-900">
                  {a.question?.message ?? '(question unavailable)'}
                </p>
                <p className="mt-2 text-gray-800">
                  {a.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-gray-400 text-xs text-center p-8">
          © {new Date().getFullYear()} Tommyhil Doan. All rights reserved.
        </p>
      </div>
    </main>
  )
}