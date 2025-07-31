import Image from 'next/image'

interface Props {
  title: string
  description: string
  imageSrc: string
  link?: string
}

export default function ProjectCard({ title, description, imageSrc, link }: Props) {
  return (
    <article className="border rounded-lg p-4 shadow-lg bg-white" aria-labelledby={title.replace(/\s+/g, '-') + '-title'}>
      <Image
        src={imageSrc}
        alt={title + ' screenshot'}
        width={600}
        height={400}
        className="mb-2 rounded"
      />
      <h3 id={title.replace(/\s+/g, '-') + '-title'} className="text-xl font-semibold font-heading mb-2">
        {title}
      </h3>
      <p className="mb-2 text-gray-700">{description}</p>
      {link && (
        <a href={link} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
          View More
        </a>
      )}
    </article>
  )
}
