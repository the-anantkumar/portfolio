import Head from 'next/head'
import TimelineItem from '../components/TimelineItem'

export default function Experience() {
  return (
    <>
      <Head>
        <title>Experience - Portfolio</title>
        <meta name="description" content="Professional work and experiences." />
      </Head>
      <h1 className="text-4xl font-bold mb-4">Experience</h1>
      <ul className="border-l-2 border-gray-300 ml-2">
        <TimelineItem title="Company A" subtitle="Role" date="2020 - Present">
          Brief description of your role at Company A.
        </TimelineItem>
        <TimelineItem title="Company B" subtitle="Role" date="2018 - 2020">
          Brief description of your role at Company B.
        </TimelineItem>
      </ul>
    </>
  )
}
