import { JsonLd } from "@/components/json-ld";
import { ProjectsBrowser } from "@/components/public-content-browser";
import { PublicInquiry, PublicPageHeading, PublicPageLayout } from "@/components/public-page-layout";
import { ShareButton } from "@/components/share-button";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { getAllPublicProjects } from "@/lib/public-content";
import { buildProjectsListJsonLd, getProjectsListUrl } from "@/lib/project-seo";

export async function PublicProjectsPage() {
  const [settings, projects] = await Promise.all([getPublicBusinessSettings(), getAllPublicProjects()]);
  const whatsappHref = toWhatsAppLink(settings.whatsapp, "Hi, I saw your project portfolio and would like similar work for my space.");
  return <PublicPageLayout settings={settings} whatsappHref={whatsappHref}>
    <JsonLd data={buildProjectsListJsonLd(projects, settings)} />
    <PublicPageHeading eyebrow="Ceiling & interior project portfolio" title="Spaces brought to life." share={<ShareButton variant="icon" label="Share projects" title={`Projects — ${settings.businessName}`} text={`Ceiling and interior projects in ${settings.city}`} url={getProjectsListUrl()} className="border-[#d8d0c3] bg-transparent" />}>
      <p className="mt-4 max-w-[36ch] text-sm leading-6 text-[#746e63]">Explore our work, the finishes we chose and the details that made each space.</p>
    </PublicPageHeading>
    <ProjectsBrowser projects={projects} />
    <PublicInquiry settings={settings} whatsappHref={whatsappHref} title="Your space could be next." />
  </PublicPageLayout>;
}
