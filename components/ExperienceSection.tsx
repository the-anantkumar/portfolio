import TimelineItem from './TimelineItem'

export default function ExperienceSection() {
  return (
    <section id="experience" className="py-20">
      <h2 className="text-3xl font-bold font-heading mb-4 text-center">Experience</h2>
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
          subtitle="R&D Intern"
          date="Jun 2023 - Dec 2023"
        >
          Built a mobile app for patented research using smartphone sensors.
        </TimelineItem>
      </ul>
    </section>
  )
}
