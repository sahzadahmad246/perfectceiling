"use client";

import { FolderKanban, Loader2, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getProjectById,
  projectDetailToForm,
} from "@/app/admin/projects/actions";
import { PageSpinner } from "@/components/page-spinner";
import { ProjectCard } from "@/components/project-card";
import { ProjectFormModal } from "@/components/project-form-modal";
import { ProjectsPageHeader } from "@/components/projects-page-header";
import { useAppRouter } from "@/hooks/use-app-router";
import { applyProjectSearch, type ProjectListItem } from "@/lib/projects";

type ProjectsPageClientProps = {
  projects: ProjectListItem[];
};

type ProjectsListParams = {
  q?: string;
  create?: string;
  edit?: string;
};

function buildProjectsUrl({ q, create, edit }: ProjectsListParams) {
  const params = new URLSearchParams();

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  if (create) {
    params.set("create", create);
  }

  if (edit) {
    params.set("edit", edit);
  }

  const query = params.toString();

  return query ? `/admin/projects?${query}` : "/admin/projects";
}

export function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const createParam = searchParams.get("create");
  const editId = searchParams.get("edit");

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [editData, setEditData] = useState(
    null as ReturnType<typeof projectDetailToForm> | null,
  );
  const [loadingEdit, setLoadingEdit] = useState(false);

  const modalOpen = createParam === "1" || Boolean(editId);
  const isSearchPending = searchInput.trim() !== urlQuery.trim();

  const updateListParams = useCallback(
    (next: Partial<ProjectsListParams>) => {
      router.replace(
        buildProjectsUrl({
          q: next.q ?? urlQuery,
          create: next.create,
          edit: next.edit,
        }),
        { scroll: false },
      );
    },
    [router, urlQuery],
  );

  const filteredProjects = useMemo(
    () => applyProjectSearch(projects, urlQuery),
    [projects, urlQuery],
  );

  const existingSlugs = useMemo(
    () => projects.map((project) => project.slug),
    [projects],
  );

  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput.trim() !== urlQuery.trim()) {
        updateListParams({ q: searchInput });
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchInput, updateListParams, urlQuery]);

  useEffect(() => {
    if (!editId) {
      setEditData(null);
      setLoadingEdit(false);
      return;
    }

    let cancelled = false;
    setLoadingEdit(true);

    getProjectById(editId)
      .then((project) => {
        if (cancelled) {
          return;
        }

        setEditData(project ? projectDetailToForm(project) : null);
        setLoadingEdit(false);
      })
      .catch(() => {
        if (!cancelled) {
          setEditData(null);
          setLoadingEdit(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  function closeModal() {
    updateListParams({ create: undefined, edit: undefined });
  }

  function openCreateModal() {
    updateListParams({ create: "1", edit: undefined });
  }

  function openEditModal(id: string) {
    updateListParams({ create: undefined, edit: id });
  }

  return (
    <>
      <ProjectsPageHeader onAddProject={openCreateModal} />

      <section className="py-4">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            size={16}
          />
          <input
            className="h-11 w-full rounded-full border border-border-soft bg-surface-raised pl-10 pr-10 text-sm outline-none transition focus:border-border-strong"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search projects"
            value={searchInput}
          />
          {isSearchPending ? (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted"
              size={16}
            />
          ) : null}
        </label>
      </section>

      {filteredProjects.length > 0 ? (
        <section className="grid gap-4 pb-8 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              onEdit={openEditModal}
              project={project}
            />
          ))}
        </section>
      ) : (
        <section className="py-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface-muted text-muted">
            <FolderKanban size={24} />
          </div>
          <h2 className="mt-4 font-primary text-xl font-medium">
            {urlQuery.trim() ? "No matching projects" : "No projects yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            {urlQuery.trim()
              ? "Try another search term."
              : "Add completed ceiling work with photos to show on the public homepage."}
          </p>
        </section>
      )}

      {loadingEdit && editId ? <PageSpinner label="Loading project..." /> : null}

      <ProjectFormModal
        existingSlugs={existingSlugs}
        initialData={editData ?? undefined}
        onClose={closeModal}
        onSaved={() => router.refresh()}
        open={modalOpen && (!editId || Boolean(editData))}
        projectId={editId ?? undefined}
      />
    </>
  );
}