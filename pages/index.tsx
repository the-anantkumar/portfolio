import Head from 'next/head'
import Image from 'next/image'

import ContactForm from '../components/ContactForm'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import ProjectCard from '../components/ProjectCard'
import TimelineItem from '../components/TimelineItem'

export default function Home() {

  return (
    <>
      <Head>
        <title>Home - Portfolio</title>
        <meta name="description" content="Personal portfolio homepage" />
        <meta property="og:title" content="Home - Portfolio" />
        <meta property="og:description" content="Personal portfolio homepage" />
        <meta property="og:image" content="/images/profile.svg" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Hero />

      <motion.section
        id="about"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Image
          src="/images/profile.svg"
          alt="Profile photo"
          width={200}
          height={200}
          className="mx-auto rounded-full mb-4"
        />
        <h1 className="text-4xl font-bold font-heading mb-4">About Me</h1>
        <p>
          I'm Anant Kumar Srivastava, a software engineer with a B.E. in
          Electronics and Instrumentation and an M.Sc. in Mathematics from BITS
          Pilani (2019–2024). I enjoy creating scalable data systems and simple
          user experiences.
        </p>
      </motion.section>

      <motion.section
        id="projects"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
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
      </motion.section>

      <motion.section
        id="experience"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold font-heading mb-4">Experience</h1>
        <ul className="border-l-2 border-gray-300 ml-2">
          <TimelineItem
            title="Nielsen Media"
            subtitle="Member of Technical Staff"
            date="Jul 2024 - Present"
          >
            Developed event-driven microservices and automated data pipelines using AWS, Redis, and Airflow.
          </TimelineItem>
          <TimelineItem
            title="SAP Labs"
            subtitle="Developer Intern"
            date="Feb 2024 - Jul 2024"
          >
            Created an SAPUI5 logging plugin and internal DevOps tools with Jira integrations.
          </TimelineItem>
          <TimelineItem
            title="IIIT Delhi"
            subtitle="R&amp;D Intern"
            date="Jun 2023 - Dec 2023"
          >
            Built a mobile app for patented research using smartphone sensors.
          </TimelineItem>
        </ul>
      </motion.section>

      <motion.section
        id="skills"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold font-heading mb-4">Skills</h1>
        <h2 className="text-2xl font-semibold font-heading mt-4">Languages</h2>
        <ul className="list-disc list-inside text-left">
          <li>C++, Java, JavaScript, Python, SQL, Bash</li>
        </ul>
        <h2 className="text-2xl font-semibold font-heading mt-4">Technologies</h2>
        <ul className="list-disc list-inside text-left">
          <li>
            AWS, Apache Airflow, Kubernetes, Docker, Redis, Presto/PostgreSQL,
            Maven, Gradle, CI/CD, Google Cloud, Grafana, Node.js, HTML/CSS,
            Terraform, Terragrunt, Spark, Git, Linux
          </li>
        </ul>
      </motion.section>

      <motion.section
        id="achievements"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold font-heading mb-4">Achievements</h1>
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
      </motion.section>

      <motion.section
        id="contact"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold font-heading mb-4">Contact</h1>
        <ContactForm idPrefix="home-contact" className="max-w-md space-y-4 mx-auto" />
      </motion.section>
    </>
  )
}
