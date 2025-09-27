import { tagColors } from "@/constants/tags"

type ProjectProps = {
  name: string
  description: string
  tags?: string[]
  link?: string
  rightSlot?: React.ReactNode
}

function ProjectContent({
  name,
  description,
  tags = [],
  rightSlot,
}: Omit<ProjectProps, "link">) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start">
      <div className="flex-1 mb-4 sm:mb-0 sm:mr-2">
        <h3 className="font-medium mb-2">{name}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="flex flex-col items-start sm:items-end sm:w-44 gap-2">
        <div className="flex flex-wrap gap-x-2 gap-y-2 justify-start sm:justify-end w-full">
          {tags.map((t) => {
            const style = tagColors[t] || "bg-gray-400 text-white"
            return (
              <span key={t} className={`px-2 py-1 text-xs rounded-full ${style}`}>
                {t}
              </span>
            )
          })}
        </div>
        {rightSlot}
      </div>
    </div>
  )
}

export function Project({ name, description, tags, link, rightSlot }: ProjectProps) {
  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-xl p-4 -mx-3 transition
           hover:bg-gray-100 hover:scale-[1.02]
           focus:bg-gray-150 focus:outline-none
           cursor-pointer mb-6 transform duration-200 ease-out"
      >
        <ProjectContent name={name} description={description} tags={tags} rightSlot={rightSlot} />
      </a>
    )
  }

  // Non-clickable fallback
  return (
    <div className="mb-6">
      <ProjectContent name={name} description={description} tags={tags} rightSlot={rightSlot} />
    </div>
  )
}
