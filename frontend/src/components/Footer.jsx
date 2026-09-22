"use client"
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import { motion } from "framer-motion";

export const Footer = () => {
  const socialLinks = [
    { icon: <FaWhatsapp className="w-5 h-5" />, name: "WhatsApp" },
    { icon: <FaFacebook className="w-5 h-5" />, name: "Facebook" },
    { icon: <FaInstagram className="w-5 h-5" />, name: "Instagram" },
    { icon: <FaTwitter className="w-5 h-5" />, name: "Twitter" },
    { icon: <FaLinkedin className="w-5 h-5" />, name: "LinkedIn" }
  ];

  const services = [
    "Organic Waste Marketplace",
    "Inorganic Waste Solutions",
    "Transport & Logistics",
    "Waste Processing",
    "Sustainable Products"
  ];

  const companyLinks = [
    "About Us",
    "Our Mission",
    "Team",
    "Careers",
    "Partners"
  ];

  const contactInfo = [
    { icon: <MdPhone className="text-green-400" />, text: "+94 76 123 4567" },
    { icon: <MdEmail className="text-green-400" />, text: "waste2wealth.agriwaste@gmail.com" },
    { icon: <MdLocationOn className="text-green-400" />, text: "453 Seevali Mawatha, Malabe, Sri Lanka" }
  ];

  return (
    <footer className="px-4 pt-16 pb-8 text-white bg-zinc-900">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center">
              <div className="p-2 mr-3 bg-green-600 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-400">Waste2Wealth</h2>
            </div>
            <p className="text-gray-300">
              Transforming agricultural waste into sustainable wealth through innovative solutions and circular economy practices.
            </p>
          </motion.div>

          {/* Services */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-4 text-lg font-semibold text-green-400">OUR SERVICES</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a href="#" className="flex items-center text-gray-300 transition-colors hover:text-green-400">
                    <span className="w-2 h-2 mr-2 bg-green-400 rounded-full"></span>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-4 text-lg font-semibold text-green-400">COMPANY</h3>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="flex items-center text-gray-300 transition-colors hover:text-green-400">
                    <span className="w-2 h-2 mr-2 bg-green-400 rounded-full"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-green-400">CONTACT US</h3>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-start">
                  <span className="mt-1 mr-3">{info.icon}</span>
                  <span className="text-gray-300">{info.text}</span>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-green-400">FOLLOW US</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    className="p-2 transition-colors rounded-full bg-zinc-800 hover:bg-green-600"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="pt-8 mt-16 text-sm text-center text-gray-400 border-t border-gray-800"
        >
          <div className="flex flex-col items-center justify-center">
            <p className="text-center">
              &copy; {new Date().getFullYear()} Waste2Wealth. All rights reserved. | 
              <a href="#" className="ml-1 hover:text-green-400">Terms of Service</a> | 
              <a href="#" className="ml-1 hover:text-green-400">Privacy Policy</a>
            </p>
            <p className="mt-2 text-center">Proudly made in Sri Lanka</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}