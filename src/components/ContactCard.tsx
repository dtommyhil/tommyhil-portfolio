import { ReactNode } from "react"

type ContactCardProps = {
  label: string
  value: string
  href: string
  icon: ReactNode
}

export default function ContactCard({ label, value, href, icon }: ContactCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center rounded-2xl border border-gray-200 px-4 py-3 hover:shadow-md transition"
    >
      <div className="text-gray-600 ml-1 mr-4">{icon}</div>
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-gray-500">{value}</div>
      </div>
    </a>
  )
}
