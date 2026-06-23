import type { PublicService } from "@/lib/public-content";
import { PublicServicePreviewCard } from "@/components/public-service-preview-card";

type PublicServiceCardProps = {
  service: PublicService;
};

export function PublicServiceCard({ service }: PublicServiceCardProps) {
  return <PublicServicePreviewCard service={service} />;
}