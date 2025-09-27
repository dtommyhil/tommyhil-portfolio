type TimelineItem = {
  title: string
  right?: string
  subtitle?: string
  bullets?: string[]
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-36 flex-shrink-0 mb-6 md:mb-0">
        <h2 className="text-xl font-semibold">Timeline</h2>
      </div>

      <div className="flex-1 space-y-8">
        {items.map((it, i) => (
          <div key={i} className="border-l-2 border-gray-200 pl-4 mb-8">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium">{it.title}</h3>
              {it.right && <span className="text-gray-600 italic">{it.right}</span>}
            </div>
            {it.subtitle && <p className="text-gray-600 mb-1">{it.subtitle}</p>}
            {it.bullets?.map((b, j) => (
              <Bullet key={j}>{b}</Bullet>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-gray-600">
      •<span className="ml-3">{children}</span>
    </p>
  )
}
