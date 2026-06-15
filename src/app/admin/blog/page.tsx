import { BookOpenText } from "lucide-react";
import type { Metadata } from "next";

import { AdminEmptyState } from "@/components/admin-empty-state";

export const metadata: Metadata = {
  title: "Blogs",
};

export default function BlogPage() {
  return (
    <>
      <section className="py-10">
        <p className="text-sm text-muted">Blogs</p>
        <h2 className="mt-3 text-4xl font-medium leading-tight">
          SEO articles for ceiling services.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Blogs will target searches like false ceiling cost, POP vs PVC,
          gypsum ceiling, wooden ceiling, and maintenance tips.
        </p>
      </section>

      <AdminEmptyState
        icon={BookOpenText}
        title="No blog posts yet"
        text="The blog editor will come after core business tools. It will support draft, publish, SEO title, meta description, and featured image."
      />
    </>
  );
}
