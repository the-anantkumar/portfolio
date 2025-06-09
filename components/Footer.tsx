export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Portfolio
      </div>
    </footer>
  )
}
