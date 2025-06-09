import Link from 'next/link'

export default function Hero() {
  return (
    <section className="py-20 text-center" aria-label="Introduction">
      <h1 className="text-5xl font-bold mb-4">Welcome to my Portfolio</h1>
      <p className="text-lg mb-6">Explore my work and experience.</p>
      <Link href="/projects" className="inline-block bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700">
        View Projects
      </Link>
    </section>
  )
}
