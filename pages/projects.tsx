import Head from 'next/head'

export default function Projects() {
  return (
    <div className="px-8">
      <Head>
        <title>Projects - Portfolio</title>
        <meta name="description" content="A showcase of my projects and work." />
      </Head>
      <main className="min-h-screen py-16">
        <h1 className="text-4xl font-bold mb-4">Projects</h1>
        <p>Describe your projects here.</p>
      </main>
    </div>
  )
}
