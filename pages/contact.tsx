import Head from 'next/head'
import ContactForm from '../components/ContactForm'

export default function Contact() {

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
      <ContactForm idPrefix="contact" />
    </>
  )
}
