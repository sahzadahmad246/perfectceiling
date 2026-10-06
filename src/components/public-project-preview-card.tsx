import { ArrowUpRight, ImageIcon, MapPin } from "lucide-react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import Link from "next/link";

import type { PublicProject } from "@/lib/public-content";
import { getProjectPublicPath, getProjectStatusLabel } from "@/lib/projects";

export function PublicProjectPreviewCard({ project, index, lcpImage = false }: { project: PublicProject; index?: number; lcpImage?: boolean }) {
  const image = project.imageUrl || project.galleryImages[0]?.url;
  return <article>
    <Link href={getProjectPublicPath(project.slug)} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e8e2d8]">
        {image ? <Image alt={project.title} src={image} fill loading={lcpImage ? "eager" : "lazy"} fetchPriority={lcpImage ? "high" : "auto"} sizes="(max-width: 560px) calc(100vw - 32px), 496px" className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none" unoptimized={shouldBypassImageOptimization(image)} /> : <div className="flex h-full items-center justify-center text-[#91704a]"><ImageIcon aria-hidden size={30} strokeWidth={1.2} /></div>}
        <span className="absolute bottom-3 left-3 rounded-full bg-[#f3f0e9]/95 px-3 py-1.5 text-[10px] font-medium text-[#4d493f]">{getProjectStatusLabel(project.status)}</span>
      </div>
      <div className="flex items-start gap-3 pt-4">
        {index !== undefined ? <span className="pt-1 font-primary text-xs text-[#b2a38d]">{String(index + 1).padStart(2, "0")}</span> : null}
        <div className="min-w-0 flex-1"><p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#91704a]">{project.serviceType || "Interior project"}</p><h2 className="mt-1.5 font-primary text-[22px] font-medium leading-tight tracking-[-0.03em]">{project.title}</h2>{project.location ? <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#827563]"><MapPin aria-hidden size={12} />{project.location}</p> : null}{project.shortDescription ? <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#746e63]">{project.shortDescription}</p> : null}</div>
        <ArrowUpRight aria-hidden className="mt-6 shrink-0 text-[#91704a]" size={20} strokeWidth={1.5} />
      </div>
    </Link>
  </article>;
}
