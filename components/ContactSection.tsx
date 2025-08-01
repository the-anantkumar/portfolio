import ContactForm from './ContactForm'

export default function ContactSection() {
  return (
    <section id="contact" className="py-20">
      <h2 className="text-3xl font-bold font-heading mb-4 text-center">Contact</h2>
      <ContactForm idPrefix="home-contact" />
    </section>
  )
}
