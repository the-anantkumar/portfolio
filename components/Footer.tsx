import { motion } from 'framer-motion'

export default function Footer() {
  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/your-username', icon: '🔗' },
    { name: 'LinkedIn', href: 'https://linkedin.com/in/your-profile', icon: '💼' },
    { name: 'Twitter', href: 'https://twitter.com/your-handle', icon: '🐦' },
    { name: 'Email', href: 'mailto:your-email@example.com', icon: '📧' },
  ]

  return (
    <motion.footer 
      className="relative mt-20 backdrop-blur-lg bg-white/5 dark:bg-black/20 border-t border-white/10 dark:border-white/5" 
      role="contentinfo"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent dark:from-white/5 pointer-events-none" />
      
      <div className="relative container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3 items-center">
          {/* Brand Section */}
          <motion.div 
            className="text-center md:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold font-heading bg-gradient-to-r from-accent to-primary-400 bg-clip-text text-transparent mb-2">
              Anant Kumar Srivastava
            </h3>
            <p className="text-sm text-gray-400">
              Building the future, one line of code at a time
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex justify-center space-x-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-3 rounded-full backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                viewport={{ once: true }}
                aria-label={link.name}
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-300 block">
                  {link.icon}
                </span>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/20 to-primary-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-dark-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {link.name}
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Copyright */}
          <motion.div 
            className="text-center md:text-right"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} All rights reserved
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Made with ❤️ and lots of ☕
            </p>
          </motion.div>
        </div>

        {/* Decorative line */}
        <motion.div 
          className="mt-8 pt-6 border-t border-white/10 dark:border-white/5 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          viewport={{ once: true }}
        >
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
        </motion.div>
      </div>
    </motion.footer>
  )
}