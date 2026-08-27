"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="py-8 sm:py-6"
        >
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <Image src="/kronova-logo-footer.svg" alt="Kronova" width={160} height={48} className="h-10 w-auto" />
            </div>
            <div className="text-gray-400 text-sm sm:text-base text-center md:text-left">
              © {new Date().getFullYear()} Kronova AI ROI Calculator. All rights reserved.
            </div>
            <div className="text-gray-400 text-sm sm:text-base text-center md:text-right">
              Contact:{" "}
              <a
                href="mailto:help@kronova.io"
                className="text-[#00CED1] hover:text-[#0088CC] transition-colors underline-offset-2 hover:underline"
              >
                help@kronova.io
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
