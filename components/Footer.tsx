export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 py-6 text-center text-sm">
        &copy; {new Date().getFullYear()} Your Name
      </div>
    </footer>
  )
}
