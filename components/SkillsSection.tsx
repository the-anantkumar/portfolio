<<<<<<< HEAD
export default function SkillsSection() {
  return (
    <section id="skills" className="py-20">
      <h2 className="text-3xl font-bold font-heading mb-4 text-center">Skills</h2>
      <h3 className="text-2xl font-semibold font-heading mt-4">Languages</h3>
      <ul className="list-disc list-inside text-left">
        <li>C++, Java, JavaScript, Python, SQL, Bash</li>
      </ul>
      <h3 className="text-2xl font-semibold font-heading mt-4">Technologies</h3>
      <ul className="list-disc list-inside text-left">
        <li>
          AWS, Apache Airflow, Kubernetes, Docker, Redis, Presto/PostgreSQL,
          Maven, Gradle, CI/CD, Google Cloud, Grafana, Node.js, HTML/CSS,
          Terraform, Terragrunt, Spark, Git, Linux
        </li>
      </ul>
    </section>
=======
import { motion } from 'framer-motion'

export default function SkillsSection() {
  return (
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
          AWS, Apache Airflow, Kubernetes, Docker, Redis, Presto/PostgreSQL, Maven,
          Gradle, CI/CD, Google Cloud, Grafana, Node.js, HTML/CSS, Terraform,
          Terragrunt, Spark, Git, Linux
        </li>
      </ul>
    </motion.section>
>>>>>>> codex/fix-hydration-and-build-issues
  )
}
