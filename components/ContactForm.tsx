import { useState } from 'react'

export async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>,
  setStatus: (status: string | null) => void
) {
  e.preventDefault()
  const form = e.currentTarget
  const data = {
    name: (form.elements.namedItem('name') as HTMLInputElement)?.value || '',
    email: (form.elements.namedItem('email') as HTMLInputElement)?.value || '',
    message: (form.elements.namedItem('message') as HTMLTextAreaElement)?.value || '',
  }

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setStatus('Message sent!')
      form.reset()
    } else {
      const body = await res.json()
      setStatus(body.error || 'Something went wrong')
    }
  } catch (err) {
    setStatus('Failed to submit form')
  }
}

interface Props {
  idPrefix?: string
  className?: string
}

export default function ContactForm({ idPrefix = 'contact', className = 'max-w-md space-y-4' }: Props) {
  const [status, setStatus] = useState<string | null>(null)

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e, setStatus)} className={className} aria-label="Contact form">
        <label className="block" htmlFor={`${idPrefix}-name`}>
          <span className="sr-only">Name</span>
          <input id={`${idPrefix}-name`} className="w-full p-2 border" name="name" placeholder="Name" required />
        </label>
        <label className="block" htmlFor={`${idPrefix}-email`}>
          <span className="sr-only">Email</span>
          <input id={`${idPrefix}-email`} className="w-full p-2 border" name="email" type="email" placeholder="Email" required />
        </label>
        <label className="block" htmlFor={`${idPrefix}-message`}>
          <span className="sr-only">Message</span>
          <textarea id={`${idPrefix}-message`} className="w-full p-2 border" name="message" placeholder="Message" required />
        </label>
        <button type="submit" className="px-4 py-2 bg-accent text-white">Send</button>
      </form>
      {status && (
        <p className="mt-4" role="status">
          {status}
        </p>
      )}
    </>
  )
}
