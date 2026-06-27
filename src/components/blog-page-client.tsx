"use client";

import { BookOpenText, Loader2, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getBlogPostById } from "@/app/admin/blog/actions";
import { BlogCard } from "@/components/blog-card";
import { BlogFormModal } from "@/components/blog-form-modal";
import { BlogPageHeader } from "@/components/blog-page-header";
import { PageSpinner } from "@/components/page-spinner";
import { useAppRouter } from "@/hooks/use-app-router";
import {
  applyBlogSearch,
  blogDetailToForm,
  type BlogFormInput,
  type BlogListItem,
} from "@/lib/blog";

type BlogPageClientProps = {
  posts: BlogListItem[];
};

type BlogListParams = {
  q?: string;
  create?: string;
  edit?: string;
};

function buildBlogUrl({ q, create, edit }: BlogListParams) {
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

  return query ? `/admin/blog?${query}` : "/admin/blog";
}

export function BlogPageClient({ posts }: BlogPageClientProps) {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const createParam = searchParams.get("create");
  const editId = searchParams.get("edit");

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [editData, setEditData] = useState<BlogFormInput | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const modalOpen = createParam === "1" || Boolean(editId);
  const isSearchPending = searchInput.trim() !== urlQuery.trim();

  const updateListParams = useCallback(
    (next: Partial<BlogListParams>) => {
      router.replace(
        buildBlogUrl({
          q: next.q ?? urlQuery,
          create: next.create,
          edit: next.edit,
        }),
        { scroll: false },
      );
    },
    [router, urlQuery],
  );

  const filteredPosts = useMemo(
    () => applyBlogSearch(posts, urlQuery),
    [posts, urlQuery],
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

    getBlogPostById(editId)
      .then((post) => {
        if (cancelled) {
          return;
        }

        setEditData(post ? blogDetailToForm(post) : null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingEdit(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  function openCreateModal() {
    updateListParams({ create: "1", edit: undefined });
  }

  function openEditModal(id: string) {
    updateListParams({ edit: id, create: undefined });
  }

  function closeModal() {
    updateListParams({ create: undefined, edit: undefined });
    setEditData(null);
    router.refresh();
  }

  return (
    <>
      <BlogPageHeader onAddPost={openCreateModal} />

      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={16}
        />
        <input
          aria-busy={isSearchPending}
          className="h-11 w-full rounded-full border border-border-strong bg-surface px-10 pr-10 text-sm outline-none transition focus:border-primary"
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search articles..."
          type="search"
          value={searchInput}
        />
        {isSearchPending ? (
          <Loader2
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted"
          />
        ) : null}
      </div>

      {filteredPosts.length === 0 ? (
        <section className="mt-8 rounded-xl border border-border-soft bg-surface-raised/60 p-6 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border-strong text-muted">
            <BookOpenText size={19} />
          </div>
          <h3 className="mt-5 text-xl font-medium">
            {posts.length === 0 ? "No articles yet" : "No matches found"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            {posts.length === 0
              ? "Tap the plus button to write your first SEO article."
              : "Try a different search term."}
          </p>
        </section>
      ) : (
        <div className="mt-5 space-y-3">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} onEdit={openEditModal} post={post} />
          ))}
        </div>
      )}

      {modalOpen && editId && (loadingEdit || !editData) ? (
        <div className="fixed inset-0 z-[9990] flex justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-[560px] flex-col items-center justify-center border-x border-border-soft bg-surface">
            <PageSpinner label="Loading article..." />
          </div>
        </div>
      ) : (
        <BlogFormModal
          existingSlugs={posts.map((post) => post.slug)}
          initialData={editData ?? undefined}
          onClose={closeModal}
          onSaved={() => router.refresh()}
          open={modalOpen && (!editId || Boolean(editData))}
          postId={editId ?? undefined}
        />
      )}
    </>
  );
}