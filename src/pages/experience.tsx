import { Helmet } from 'react-helmet'
import TimelineItem from '../components/TimelineItem'

export default function Experience() {
  return (
    <>
      <Helmet>
        <title>Experience - Portfolio</title>
        <meta name="description" content="Professional work and experiences." />
        <meta property="og:title" content="Experience - Portfolio" />
        <meta property="og:description" content="Professional work and experiences." />
        <meta property="og:image" content="/images/profile.svg" />
      </Helmet>
      <h1 className="text-4xl font-bold font-heading mb-4">Experience</h1>
      <ul className="border-l-2 border-gray-300 ml-2">
        <TimelineItem
          title="Nielsen Media"
          subtitle="Member of Technical Staff"
          date="Jul 2024 - Present"
        >
          Developed event-driven microservices and automated data pipelines using
          AWS, Redis, and Airflow.
        </TimelineItem>
        <TimelineItem
          title="SAP Labs"
          subtitle="Developer Intern"
          date="Feb 2024 - Jul 2024"
        >
          Created an SAPUI5 logging plugin and internal DevOps tools with Jira
          integrations.
        </TimelineItem>
        <TimelineItem
          title="IIIT Delhi"
          subtitle="R&amp;D Intern"
          date="Jun 2023 - Dec 2023"
        >
          Built a mobile app for patented research using smartphone sensors.
        </TimelineItem>
      </ul>
    </>
  )
}
