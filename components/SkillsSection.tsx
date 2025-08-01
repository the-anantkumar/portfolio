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
  )
}
