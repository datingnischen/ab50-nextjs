import { permanentRedirect } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function LegacyPartnersucheCityRedirect({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/de/partnersuche/${encodeURIComponent(slug)}`);
}
