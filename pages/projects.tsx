import Head from 'next/head'
import ProjectCard from '../components/ProjectCard'

export default function Projects() {
  return (
    <>
      <Head>
        <title>Projects - Portfolio</title>
        <meta name="description" content="A showcase of my projects and work." />
      </Head>
      <h1 className="text-4xl font-bold mb-4">Projects</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <ProjectCard
          title="Project One"
          description="Description of project one."
          imageSrc="/images/project1.svg"
          link="#"
        />
        <ProjectCard
          title="Project Two"
          description="Description of project two."
          imageSrc="/images/project2.svg"
          link="#"
        />
      </div>
    </>
  )
}
