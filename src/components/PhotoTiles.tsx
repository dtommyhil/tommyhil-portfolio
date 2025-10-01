'use client'

import Image from 'next/image'

type Tile = { src: string; alt: string }
type Props = {
  tiles: Tile[]
  sizePx?: number
  className?: string
}

export default function PhotoTiles({ tiles, sizePx = 168, className = '' }: Props) {
  const imgs = tiles.slice(0, 4)

  const presets = [
    ' -rotate-6',
    ' rotate-2',
    ' -rotate-1',
    ' rotate-6 hidden md:block',
  ]

  return (
    <div className={`relative mx-auto w-full max-w-3xl ${className}`}>
      <div className="flex justify-center gap-2 sm:gap-3">
        {imgs.map((img, i) => (
          <div
            key={img.src + i}
            className={[
              'relative flex-none rounded-2xl shadow-xl ring-1 ring-black/10 bg-white overflow-hidden',
              'transition-transform duration-300 ease-out hover:-translate-y-1',
              presets[i] ?? '',
            ].join(' ')}
            style={{ width: sizePx, height: sizePx }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes={`${sizePx}px`}
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </div>
  )
}