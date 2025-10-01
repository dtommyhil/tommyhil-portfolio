'use client'

import { useEffect, useState } from 'react'

interface Track {
  id: string
  name: string
  artist: string
  album: string
  image: string
  played_at?: string
}

const base = (id: string) => id.split('-')[0]

export default function SpotifyWidget() {
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const [topTracks, setTopTracks] = useState<Track[]>([])
  const [activeTab, setActiveTab] = useState<'recently' | 'top'>('recently')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [r, t] = await Promise.all([
          fetch('/api/spotify/tracks?type=recent'),
          fetch('/api/spotify/tracks?type=top'),
        ])
        const recentData = await r.json()
        const topData = await t.json()
        setRecentTracks(removeDuplicates(recentData.tracks || []))
        setTopTracks(removeDuplicates(topData.tracks || []))
      } catch (e) {
        console.error('Error fetching Spotify data:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const removeDuplicates = (tracks: Track[]) => {
    const seen = new Set<string>()
    return tracks
      .filter((trk) => {
        const b = base(trk.id)
        if (seen.has(b)) return false
        seen.add(b)
        return true
      })
      .map((trk, i) => ({ ...trk, id: `${base(trk.id)}-${i}` }))
  }

  const current = activeTab === 'recently' ? recentTracks : topTracks
  const mainTrack = current[0]
  const sideTrackList = current.slice(1, 5)

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Listening to</h2>
        <div className="flex gap-2">
          <TabButton
            label="Recently Played"
            active={activeTab === 'recently'}
            onClick={() => setActiveTab('recently')}
          />
          <TabButton
            label="Top Tracks"
            active={activeTab === 'top'}
            onClick={() => setActiveTab('top')}
          />
        </div>
      </div>

      {!loading && (
        <>
          {/* desktop (≥sm) */}
          <div className="hidden sm:flex sm:flex-row sm:flex-nowrap sm:items-stretch gap-4">
            {mainTrack && (
              <div className="sm:w-72 flex-shrink-0">
                <SpotifyEmbed
                  id={mainTrack.id}
                  className="w-[288px] h-[352px] rounded-2xl"
                />
              </div>
            )}
            <div className="flex-1 flex flex-col sm:justify-between sm:h-[352px] gap-0">
              {sideTrackList.map((t, i) => (
                <SpotifyEmbed
                  key={`${base(t.id)}-d-${i}`}
                  id={t.id}
                  className="w-full h-20 rounded-xl"
                />
              ))}
            </div>
          </div>

          {/* mobile (<sm) */}
          <div className="sm:hidden flex flex-col gap-3">
            {[mainTrack, ...sideTrackList].filter(Boolean).map((t, i) => (
              <SpotifyEmbed
                key={`${base(t!.id)}-m-${i}`}
                id={t!.id}
                className="w-full h-20 rounded-xl"
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-full transition-colors
        text-xs px-3 py-2
        sm:text-sm sm:px-4 sm:py-2
        ${active ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-100'}
      `}
    >
      {label}
    </button>
  )
}

function SpotifyEmbed({ id, className }: { id: string; className: string }) {
  const trackId = id ? id.split('-')[0] : ''
  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
      className={`block opacity-0 transition-opacity duration-300 ease-in-out ${className}`}
    />
  )
}
