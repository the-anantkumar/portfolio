import Link from 'next/link'

export default function Hero() {
  return (
    <section
      id="hero"
      className="py-32 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
      aria-label="Introduction"
    >
      <h1 className="text-6xl font-extrabold mb-6">Hi, I'm Your Name</h1>
      <p className="text-2xl mb-8">A passionate developer crafting beautiful web experiences.</p>
      <Link
        href="#projects"
        className="inline-block bg-white text-indigo-700 px-6 py-3 rounded shadow hover:bg-gray-100"
      >
        View Projects
      </Link>
    </section>
  )
}
