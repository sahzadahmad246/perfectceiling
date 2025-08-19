import type { Metadata } from "next"


export const metadata: Metadata = {
  title: "Contact Us | Perfect Ceiling",
  description:
    "Get in touch with Perfect Ceiling for professional ceiling services. Send us a message and we'll get back to you promptly.",
  openGraph: {
    title: "Contact Us | Perfect Ceiling",
    description:
      "Get in touch with Perfect Ceiling for professional ceiling services. Send us a message and we'll get back to you promptly.",
    type: "website",
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Get In Touch</h1>
            <p className="text-sm sm:text-base lg:text-lg text-blue-100 max-w-2xl mx-auto">
              Ready to transform your space? Send us a message and our team will get back to you within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          

          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-6">
            

            {/* Quick Contact */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Need immediate assistance?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                For urgent inquiries, you can reach us directly through:
              </p>
              <div className="space-y-2 sm:space-y-3">
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 p-2 sm:p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors group"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-gray-900">Call Now</div>
                    <div className="text-xs text-gray-500">Available during business hours</div>
                  </div>
                </a>

                <a
                  href="https://wa.me/1234567890?text=Hello! I'm interested in your ceiling services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 sm:p-3 bg-white rounded-lg border hover:border-green-300 transition-colors group"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-gray-900">WhatsApp</div>
                    <div className="text-xs text-gray-500">Quick response guaranteed</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Service Areas */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Service Areas</h3>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <div>• Downtown & City Center</div>
                <div>• Residential Areas</div>
                <div>• Commercial Districts</div>
                <div>• Surrounding Suburbs</div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Not sure if we serve your area? Just ask!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
