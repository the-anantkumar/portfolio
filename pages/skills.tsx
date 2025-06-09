import Head from 'next/head'

export default function Skills() {
  return (
    <div className="px-8">
      <Head>
        <title>Skills - Portfolio</title>
        <meta name="description" content="Technical skills and proficiencies." />
      </Head>
      <main className="min-h-screen py-16">
        <h1 className="text-4xl font-bold mb-4">Skills</h1>
        <p>List your skills here.</p>
      </main>
    </div>
  )
}
