import Head from 'next/head'

export default function Achievements() {
  return (
    <div className="px-8">
      <Head>
        <title>Achievements - Portfolio</title>
        <meta name="description" content="Awards and notable achievements." />
      </Head>
      <main className="min-h-screen py-16">
        <h1 className="text-4xl font-bold mb-4">Achievements</h1>
        <p>Share your achievements here.</p>
      </main>
    </div>
  )
}
