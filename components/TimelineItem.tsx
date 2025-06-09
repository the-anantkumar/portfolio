interface Props {
  title: string
  subtitle?: string
  date: string
  children?: React.ReactNode
}

export default function TimelineItem({ title, subtitle, date, children }: Props) {
  return (
    <li className="relative pl-8 pb-8">
      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-500" aria-hidden="true" />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        <time className="block text-sm text-gray-500" dateTime={date}>{date}</time>
        {children && <p className="mt-2 text-gray-700">{children}</p>}
      </div>
    </li>
  )
}
