/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

/* ---------- types ---------- */

type GhRepo = {
  name: string
  description: string | null
  html_url: string
  pushed_at: string
}

type Props = {
  repo?: string
  file?: string
  refName?: string
  title?: string
}

/* ---------- utils ---------- */

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function ghHeaders(): HeadersInit {
  return { Accept: 'application/vnd.github+json' }
}

function decodeBase64(b64: string) {
  try {
    return atob(b64.replace(/\n/g, ''))
  } catch {
    return ''
  }
}

function timeAgo(iso?: string) {
  if (!iso) return 'unknown'
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return `${s}s ago`
}

function RepoHeader({ repo, loading }: { repo: GhRepo | null; loading: boolean }) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          {loading ? 'Loading…' : repo?.name ?? '—'}
        </h3>
        <span className="text-xs text-gray-500">
          {loading ? '—' : `Last update: ${timeAgo(repo?.pushed_at)}`}
        </span>
      </div>
      {repo?.html_url && <GitHubButton url={repo.html_url} />}
    </div>
  )
}

function Tabs({
  active,
  onChange,
}: {
  active: 'overview' | 'code'
  onChange: (v: 'overview' | 'code') => void
}) {
  return (
    <div className="flex border-b border-gray-100" role="tablist" aria-label="Repository view">
      <TabButton id="overview" label="Overview" active={active === 'overview'} onClick={() => onChange('overview')} />
      <TabButton id="code-preview" label="Code Preview" active={active === 'code'} onClick={() => onChange('code')} />
    </div>
  )
}

function TabButton({
  id,
  label,
  active,
  onClick,
}: {
  id: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      id={`tab-${id}`}
      role="tab"
      aria-selected={active}
      aria-controls={`panel-${id}`}
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
        active ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
      )}
    >
      {label}
    </button>
  )
}

function AccordionPanel({
  id,
  labelledBy,
  show,
  className,
  children,
}: {
  id: string
  labelledBy: string
  show: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      aria-hidden={!show}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-500 ease-in-out',
        show ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        className
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

function GitHubButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors text-sm"
    >
      <Image src="/github.png" alt="GitHub" width={16} height={16} />
      GitHub
    </a>
  )
}

/* ---------- component ---------- */

export default function CurrentFocus({
  repo = 'dtommyhil/tf-tommy',
  file = 'README.md',
  refName,
  title = 'Current Focus',
}: Props) {
  const [tab, setTab] = useState<'overview' | 'code'>('overview')
  const [repoData, setRepoData] = useState<GhRepo | null>(null)
  const [langs, setLangs] = useState<string[]>([])
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const qs = refName ? `?ref=${encodeURIComponent(refName)}` : ''
        const [repoRes, langsRes, fileRes] = await Promise.all([
          fetch(`https://api.github.com/repos/${repo}`, { headers: ghHeaders(), signal: ac.signal }),
          fetch(`https://api.github.com/repos/${repo}/languages`, { headers: ghHeaders(), signal: ac.signal }),
          fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(file)}${qs}`, {
            headers: ghHeaders(),
            signal: ac.signal,
          }),
        ])

        if (!repoRes.ok) throw new Error('Repo not found')

        const repoJson = (await repoRes.json()) as any
        const langsJson = langsRes.ok ? ((await langsRes.json()) as Record<string, number>) : {}
        const fileJson = fileRes.ok ? ((await fileRes.json()) as any) : null

        setRepoData({
          name: repoJson.name,
          description: repoJson.description,
          html_url: repoJson.html_url,
          pushed_at: repoJson.pushed_at,
        })
        setLangs(Object.keys(langsJson))
        setContent(fileJson?.content ? decodeBase64(fileJson.content) : '')
      } catch (e: unknown) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          setError((e as Error).message || 'Failed to load GitHub data')
        }
      } finally {
        setLoading(false)
      }
    })()
    return () => ac.abort()
  }, [repo, file, refName])

  const techPills = useMemo(() => {
    if (loading) return <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
    if (!langs.length) return <span className="text-sm text-gray-500">No languages listed</span>
    return (
      <div className="flex flex-wrap gap-2">
        {langs.map((t) => (
          <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
            {t}
          </span>
        ))}
      </div>
    )
  }, [loading, langs])

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <RepoHeader repo={repoData} loading={loading} />

        <div className="px-4 pb-3 border-b border-gray-100">{techPills}</div>

        <Tabs active={tab} onChange={setTab} />

        <div className="p-4">
          {/* overview */}
          <AccordionPanel id="panel-overview" labelledBy="tab-overview" show={tab === 'overview'}>
            <p className="text-gray-700 text-sm">
              {error ? <span className="text-red-500">{error}</span> : repoData?.description || 'No description provided.'}
            </p>
          </AccordionPanel>

          {/* code preview */}
          <AccordionPanel
            id="panel-code-preview"
            labelledBy="tab-code-preview"
            show={tab === 'code'}
            className="mt-2"
          >
            <div className="bg-gray-900 rounded-lg p-3 overflow-auto max-h-96">
              <pre className="text-xs text-gray-300 font-mono leading-relaxed">
                <code>{loading ? 'Loading…' : content}</code>
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Previewing <code>{file}</code>
              {refName ? (
                <>
                  {' '}
                  @ <code>{refName}</code>
                </>
              ) : null}{' '}
              from <code>{repo}</code>
            </p>
          </AccordionPanel>
        </div>
      </div>
    </section>
  )
}
