import { useState } from 'react'
import Head from 'next/head'

export default function Contact() {
  const [status, setStatus] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
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

  return (
    <>
      <Head>
        <title>Contact - Portfolio</title>
        <meta name="description" content="Get in touch using the contact form." />
        <meta property="og:title" content="Contact - Portfolio" />
        <meta property="og:description" content="Get in touch using the contact form." />
        <meta property="og:image" content="/images/profile.svg" />
      </Head>
      <h1 className="text-4xl font-bold font-heading mb-4">Contact</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4" aria-label="Contact form">
        <label className="block" htmlFor="contact-name">
          <span className="sr-only">Name</span>
          <input id="contact-name" className="w-full p-2 border" name="name" placeholder="Name" required />
        </label>
        <label className="block" htmlFor="contact-email">
          <span className="sr-only">Email</span>
          <input id="contact-email" className="w-full p-2 border" name="email" type="email" placeholder="Email" required />
        </label>
        <label className="block" htmlFor="contact-message">
          <span className="sr-only">Message</span>
          <textarea id="contact-message" className="w-full p-2 border" name="message" placeholder="Message" required />
        </label>
        <button type="submit" className="px-4 py-2 bg-accent text-white">Send</button>
      </form>
      {status && <p className="mt-4" role="status">{status}</p>}
    </>
  )
}
