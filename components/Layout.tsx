import { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
