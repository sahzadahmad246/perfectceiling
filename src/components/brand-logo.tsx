import Image from "next/image";
import Link from "next/link";

import { getBrandLogoUrl } from "@/lib/brand-logo";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  logoUrl?: string | null;
  businessName?: string;
  href?: string;
  showName?: boolean;
  imageClassName?: string;
  className?: string;
};

export function BrandLogo({
  logoUrl,
  businessName = "Perfect Ceiling",
  href = "/",
  showName = false,
  imageClassName,
  className,
}: BrandLogoProps) {
  const src = getBrandLogoUrl(logoUrl);
  const isRemote = src.startsWith("http");

  const image = (
    <Image
      alt={`${businessName} logo`}
      className={cn(
        "size-10 shrink-0 rounded-md object-cover",
        imageClassName,
      )}
      height={40}
      src={src}
      unoptimized={isRemote}
      width={40}
    />
  );

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      {image}
      {showName ? (
        <span className="font-primary text-lg font-medium">{businessName}</span>
      ) : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      aria-label={`${businessName} home`}
      className={cn("inline-flex transition hover:opacity-90", className)}
      href={href}
    >
      {content}
    </Link>
  );
}