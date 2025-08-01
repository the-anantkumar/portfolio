import ProjectCard from './ProjectCard'

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-20">
      <h2 className="text-3xl font-bold font-heading mb-4 text-center">Projects</h2>
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
    </section>
  )
}
