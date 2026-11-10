import type { Metadata } from "next";
import { metadata as baseMetadata } from "../../ueber-uns/page";
import { mirrorMetadata } from "@/lib/mirror-metadata";

// ab50.ch-Spiegel der deutschen Seite: gleicher Inhalt, noindex statt Canonical auf ab50.de (lib/mirror-metadata.ts).
export { default } from "../../ueber-uns/page";
export const metadata: Metadata = mirrorMetadata(baseMetadata);
