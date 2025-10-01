import Header from '@/components/Header'
import PhotoTiles from '@/components/PhotoTiles'
import { Timeline } from '@/components/Timeline'
import { Project } from '@/components/Project'

const tiles = [
  { src: '/photos/monterrey.jpg', alt: 'Monterrey, Mexico' },
  { src: '/photos/newport.jpg', alt: 'Newport, California' },
  { src: '/photos/seattle.jpg', alt: 'Seattle, Washington' },
  { src: '/photos/pattaya.jpg', alt: 'Pattaya, Thailand' },
]

const timelineItems = [
  {
    title: 'University of Colorado, Boulder',
    right: 'Present',
    subtitle: 'M.S. Computer Science',
    bullets: ['"master" my coding skills'],
  },
  {
    title: 'RE/MAX Professionals',
    right: 'Present',
    subtitle: 'Broker Associate',
    bullets: ['help clients with home buying/selling'],
  },
  {
    title: 'theCoderSchool',
    subtitle: 'Coding Coach',
    bullets: ['taught others how to code'],
  },
  {
    title: 'University of Washington, Seattle',
    subtitle: 'B.A. Geography, Data Science',
    bullets: ['passed my first programming class'],
  },
]

const projects = [
  {
    name: "Personal Site (this one)",
    description: "Portfolio showcasing my interests and personality through code.",
    tags: ["TypeScript", "JavaScript", "Nextjs", "Supabase"],
    link: "https://github.com/dtommyhil/tommyhil-portfolio"
  },
  {
    name: "ebuy",
    description: "Demo e-commerce site featuring interactive product listings and shopping cart.",
    tags: ["Angular", "TypeScript", "JavaScript"],
    link: "https://github.com/dtommyhil/angular-ecomm"
  },
]


export default function About() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-2xl mx-auto px-8 py-4">
        <h1 className="text-4xl font-bold mb-3">about</h1>
        <p className="text-gray-500 text-l mb-12 max-w-2xl">
          background + experience
        </p>
        <PhotoTiles tiles={tiles} className="mb-16" />

        <div className="space-y-8 mb-8">
          <section>
            <Timeline items={timelineItems} />
          </section>
          <section>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-36 flex-shrink-0 mb-6 md:mb-0">
                <h2 className="text-xl font-semibold">Projects</h2>
              </div>

              <div className="flex-1 space-y-8">
                {projects.map((p) => (
                  <Project
                    key={p.name}
                    name={p.name}
                    description={p.description}
                    tags={p.tags}
                    link={p.link}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <p className="text-gray-400 text-xs text-center p-8">
        © 2025 Tommyhil Doan. All rights reserved.
      </p>
    </main>
  )
}
