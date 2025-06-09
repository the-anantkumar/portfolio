import Head from 'next/head'
import Image from 'next/image'

export default function About() {
  return (
    <>
      <Head>
        <title>About - Portfolio</title>
        <meta name="description" content="Learn more about the person behind this portfolio." />
      </Head>
      <Image
        src="/images/profile.svg"
        alt="Profile photo"
        width={200}
        height={200}
        className="mx-auto rounded-full mb-4"
      />
      <h1 className="text-4xl font-bold mb-4">About Me</h1>
      <p>Write something about yourself here.</p>
    </>
  )
}
