'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { ArrowRight } from "lucide-react"
import TextareaAutosize from 'react-textarea-autosize'

export default function AskForm() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<null | 'ok' | 'err'>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true); setStatus(null)

    const sb = supabaseBrowser()
    const { error } = await sb.from('questions').insert({ message })

    setSending(false)

    if (error) {
      setStatus('err')
      setTimeout(() => setStatus(null), 1200) // reset after 1.2s
      return
    }

    setStatus('ok')
    setMessage('')
    setTimeout(() => setStatus(null), 1200) // reset after 1.2s
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      ;(e.currentTarget.form as HTMLFormElement)?.requestSubmit()
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl p-3 flex items-end bg-gray-100">
      <TextareaAutosize
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={onKeyDown}
        minRows={1}
        maxRows={10}
        placeholder="Type your question.."
        className="flex-1 px-3 py-2 bg-transparent resize-none focus:outline-none rounded-xl"
      />
      <button
        type="submit"
        disabled={sending || !message.trim()}
        className={`ml-2 h-9 w-9 rounded-full text-white flex items-center justify-center transition-colors
          ${status === 'ok'
            ? 'bg-green-500'
            : status === 'err'
            ? 'bg-red-500'
            : 'bg-black hover:opacity-90 disabled:opacity-40'
          }`}
        aria-label="Send"
        title="Send"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}