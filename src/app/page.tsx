import Header from '@/components/Header'
import SpotifyWidget from '@/components/SpotifyWidget'
import CurrentFocus from '@/components/CurrentFocus'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="max-w-2xl mx-auto px-8 py-4">
        <h1 className="text-4xl font-bold mb-3">hi, i&apos;m tommyhil</h1>
        <p className="text-gray-500 text-l mb-12">
          caffeine addict documenting my coding journey —<br />
          passionate about digital media, memes, and making things click
        </p>

        <section className="mb-12">
          <CurrentFocus repo="dtommyhil/tf-tommy" file="src/App.js"/>
        </section>

        <section className="mb-12">
          <SpotifyWidget />
        </section>
      </div>
       <p className="text-gray-400 text-xs text-center p-8">
          © 2025 Tommyhil Doan. All rights reserved.
        </p>
    </main>
  )
}