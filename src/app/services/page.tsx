import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ 
    where: { enabled: true }, 
    orderBy: { orderIndex: "asc" } 
  }).catch(() => []);

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Our Services</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Professional ceiling solutions tailored to your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s) => (
          <Card
            key={s.id}
            className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden"
          >
            {s.imageUrl ? (
              <div className="relative h-40 w-full">
                <Image
                  src={s.imageUrl}
                  alt={s.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ) : null}
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
    </div>
  );
}
