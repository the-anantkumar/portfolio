import Head from 'next/head'

export default function Achievements() {
  return (
    <>
      <Head>
        <title>Achievements - Portfolio</title>
        <meta name="description" content="Awards and notable achievements." />
        <meta property="og:title" content="Achievements - Portfolio" />
        <meta property="og:description" content="Awards and notable achievements." />
        <meta property="og:image" content="/images/profile.svg" />
      </Head>
      <h1 className="text-4xl font-bold mb-4">Achievements</h1>
      <ul className="list-disc list-inside text-left">
        <li>
          Global rank&nbsp;103 among 10k+ participants in a CodeChef Div&nbsp;2
          contest.
        </li>
        <li>
          Keyboard player certified by Trinity College London with one of its
          highest rankings.
        </li>
      </ul>
    </>
  )
}
