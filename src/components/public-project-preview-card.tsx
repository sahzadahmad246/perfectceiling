import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { PublicServiceCardMedia } from "@/components/public-service-card-media";
import type { PublicProject } from "@/lib/public-content";
import {
  getProjectPublicPath,
  getProjectStatusLabel,
} from "@/lib/projects";

type PublicProjectPreviewCardProps = {
  project: PublicProject;
};

export function PublicProjectPreviewCard({
  project,
}: PublicProjectPreviewCardProps) {
  const href = getProjectPublicPath(project.slug);
  const imageAlt = `${project.title} — ${project.shortDescription ?? "Ceiling project"}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80 transition duration-200 hover:border-border-strong">
      <Link className="block" href={href}>
        <PublicServiceCardMedia
          imageAlt={imageAlt}
          images={project.galleryImages}
          title={project.title}
        />

        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {project.serviceType ? (
              <span className="text-xs text-muted">{project.serviceType}</span>
            ) : null}
            {project.status === "ongoing" ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {getProjectStatusLabel(project.status)}
              </span>
            ) : null}
          </div>

          <h3 className="mt-2 font-primary text-xl font-semibold leading-snug text-foreground">
            {project.title}
          </h3>

          {project.location ? (
            <p className="mt-2 text-sm text-muted">{project.location}</p>
          ) : null}

          {project.shortDescription ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
              {project.shortDescription}
            </p>
          ) : null}

          <span className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-200 group-hover:bg-primary-hover">
            View project
            <ArrowUpRight size={15} />
          </span>
        </div>
      </Link>
    </article>
  );
}