import Head from 'next/head'

export default function About() {
  return (
    <div className="px-8">
      <Head>
        <title>About - Portfolio</title>
        <meta name="description" content="Learn more about the person behind this portfolio." />
      </Head>
      <main className="min-h-screen py-16">
        <h1 className="text-4xl font-bold mb-4">About Me</h1>
        <p>Write something about yourself here.</p>
      </main>
    </div>
  )
}
