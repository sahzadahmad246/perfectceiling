import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ 
    where: { enabled: true }, 
    orderBy: { createdAt: "desc" } 
  }).catch(() => []);

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">What Our Clients Say</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Don't just take our word for it - hear from our satisfied customers
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <div key={t.id} className="group">
            <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-8 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-slate-700 leading-relaxed italic">"{t.content}"</blockquote>
                <div className="pt-4 border-t border-slate-100">
                  <div className="font-bold text-slate-900">{t.authorName}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
