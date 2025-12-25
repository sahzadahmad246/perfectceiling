"use server";
import Image from "next/image";
import { getHeroImages } from "@/lib/data";

export async function HeroImages() {
  const images = await getHeroImages();

  return (
    <div className="grid grid-cols-2 gap-4 lg:gap-6">
      <div className="space-y-4 lg:space-y-6">
        {images[0] && (
          <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform rotate-2 hover:rotate-3 transition-transform duration-300">
            <Image
              src={images[0].url || "/placeholder.svg"}
              alt={images[0].publicId || "Ceiling design"}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {images[1] && (
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl transform -rotate-1 hover:-rotate-2 transition-transform duration-300">
            <Image
              src={images[1].url || "/placeholder.svg"}
              alt={images[1].publicId || "Ceiling design"}
              width={400}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="space-y-4 lg:space-y-6 pt-8 lg:pt-12">
        {images[2] && (
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl transform rotate-1 hover:rotate-2 transition-transform duration-300">
            <Image
              src={images[2].url || "/placeholder.svg"}
              alt={images[2].publicId || "Ceiling design"}
              width={400}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {images[3] && (
          <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform -rotate-2 hover:-rotate-3 transition-transform duration-300">
            <Image
              src={images[3].url || "/placeholder.svg"}
              alt={images[3].publicId || "Ceiling design"}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
