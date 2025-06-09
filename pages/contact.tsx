import { useState } from 'react'
import Head from 'next/head'

export default function Contact() {
  const [status, setStatus] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
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
    <div className="px-8">
      <Head>
        <title>Contact - Portfolio</title>
        <meta name="description" content="Get in touch using the contact form." />
      </Head>
      <main className="min-h-screen py-16">
        <h1 className="text-4xl font-bold mb-4">Contact</h1>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <input className="w-full p-2 border" name="name" placeholder="Name" required />
          <input className="w-full p-2 border" name="email" type="email" placeholder="Email" required />
          <textarea className="w-full p-2 border" name="message" placeholder="Message" required />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white">Send</button>
        </form>
        {status && <p className="mt-4">{status}</p>}
      </main>
    </div>
  )
}
