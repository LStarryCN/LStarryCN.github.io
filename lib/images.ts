import fs from "node:fs";
import path from "node:path";

type ImageAsset = { src: string; width: number; height: number; widths: number[]; base: string; blur: string };

let imageManifest: Record<string, ImageAsset> | undefined;

export function getImageAsset(slug: string, src: string): ImageAsset | undefined {
  if (!imageManifest) {
    const file = path.join(process.cwd(), "public", "image-manifest.json");
    imageManifest = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  }
  return imageManifest?.[`${slug}:${src}`];
}
