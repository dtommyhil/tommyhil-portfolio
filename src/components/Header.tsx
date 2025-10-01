'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  const linkClass = (href: string) =>
    `px-4 py-2 rounded-full transition-colors ${
      pathname === href ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <header className="w-full py-8">
      <div className="max-w-2xl mx-auto px-8 pr-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-black rounded-full" />
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <Link href="/" className={linkClass('/')} >Home</Link>
            <Link href="/about" className={linkClass('/about')}>About</Link>
            <Link href="/contact" className={linkClass('/contact')}>Contact</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
