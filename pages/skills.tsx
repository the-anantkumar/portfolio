import Head from 'next/head'

export default function Skills() {
  return (
    <>
      <Head>
        <title>Skills - Portfolio</title>
        <meta name="description" content="Technical skills and proficiencies." />
      </Head>
      <h1 className="text-4xl font-bold mb-4">Skills</h1>
      <h2 className="text-2xl font-semibold mt-4">Languages</h2>
      <ul className="list-disc list-inside text-left">
        <li>C++, Java, JavaScript, Python, SQL, Bash</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-4">Technologies</h2>
      <ul className="list-disc list-inside text-left">
        <li>
          AWS, Apache Airflow, Kubernetes, Docker, Redis, Presto/PostgreSQL,
          Maven, Gradle, CI/CD, Google Cloud, Grafana, Node.js, HTML/CSS,
          Terraform, Terragrunt, Spark, Git, Linux
        </li>
      </ul>
    </>
  )
}
