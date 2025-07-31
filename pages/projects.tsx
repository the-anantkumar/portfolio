import Head from 'next/head'
import ProjectCard from '../components/ProjectCard'

export default function Projects() {
  return (
    <>
      <Head>
        <title>Projects - Portfolio</title>
        <meta name="description" content="A showcase of my projects and work." />
        <meta property="og:title" content="Projects - Portfolio" />
        <meta property="og:description" content="A showcase of my projects and work." />
        <meta property="og:image" content="/images/profile.svg" />
      </Head>
      <h1 className="text-4xl font-bold font-heading mb-4">Projects</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <ProjectCard
          title="Codeforces POTD Extension"
          description="Chrome extension recommending daily Codeforces problems; 2500+ users with a 4.9★ rating."
          imageSrc="/images/project1.svg"
          link="#"
        />
        <ProjectCard
          title="Image Encryption App"
          description="Java Swing tool using chaotic logistic maps for fast image encryption."
          imageSrc="/images/project2.svg"
          link="#"
        />
      </div>
    </>
  )
}
