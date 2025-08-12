import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Phone, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import '../app/globals.css'

interface BusinessProfile {
  businessName: string;
  about: string | null;
  address: string | null;
  primaryPhone: string | null;
  secondaryPhone: string | null;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  enabled: boolean;
  orderIndex: number | null;
}

interface Testimonial {
  id: string;
  content: string;
  authorName: string;
  enabled: boolean;
  createdAt: Date;
}

export default async function LandingPage() {
  let settings: BusinessProfile | null = null;
  let services: Service[] = [];
  let testimonials: Testimonial[] = [];

  try {
    [settings, services, testimonials] = await Promise.all([
      prisma.businessProfile.findFirst(),
      prisma.service.findMany({ where: { enabled: true }, orderBy: { orderIndex: "asc" } }),
      prisma.testimonial.findMany({ where: { enabled: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    ]);
  } catch  {
    // Database not migrated yet; show a friendly placeholder
    settings = {
      businessName: "Perfect Ceiling",
      about: "We provide POP, gypsum, PVC and wooden false ceiling solutions.",
      address: "",
      primaryPhone: "",
      secondaryPhone: "",
    };
    services = [];
    testimonials = [];
  }

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50"></div>
        <div className="relative text-center space-y-8 py-24 px-6">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
              {settings?.businessName || "Perfect Ceiling"}
            </h1>
            {settings?.about && (
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                {settings.about}
              </p>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-600">
            {settings?.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{settings.address}</span>
              </div>
            )}
            {(settings?.primaryPhone || settings?.secondaryPhone) && (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="font-medium">
                  {[settings?.primaryPhone, settings?.secondaryPhone].filter(Boolean).join(" / ")}
                </span>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get a quotation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-slate-900">Our Services</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional ceiling solutions tailored to your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s) => (
            <Card
              key={s.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white"
            >
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {s.title}
                  </CardTitle>
                  {s.description && <p className="text-slate-600 leading-relaxed">{s.description}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-slate-900">What Our Clients Say</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Do not just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
                <CardContent className="p-6 md:p-8 space-y-3 md:space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 leading-relaxed italic">{t.content}</blockquote>
                  <div className="pt-3 md:pt-4 border-t border-slate-100">
                    <div className="font-bold text-slate-900">{t.authorName}</div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}