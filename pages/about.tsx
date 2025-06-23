import Head from 'next/head'
import Image from 'next/image'

export default function About() {
  return (
    <>
      <Head>
        <title>About - Portfolio</title>
        <meta name="description" content="Learn more about the person behind this portfolio." />
        <meta property="og:title" content="About - Portfolio" />
        <meta property="og:description" content="Learn more about the person behind this portfolio." />
        <meta property="og:image" content="/images/profile.svg" />
      </Head>
      <Image
        src="/images/profile.svg"
        alt="Profile photo"
        width={200}
        height={200}
        className="mx-auto rounded-full mb-4"
      />
      <h1 className="text-4xl font-bold mb-4">About Me</h1>
      <p>
        I'm Anant Kumar Srivastava, a software engineer with a B.E. in Electronics
        and Instrumentation and an M.Sc. in Mathematics from BITS Pilani
        (2019–2024). I enjoy creating scalable data systems and simple user
        experiences.
      </p>
    </>
  )
}
