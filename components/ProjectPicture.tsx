import { getImageAsset } from "@/lib/images";
import type { ProjectImage } from "@/types/content";

export function ProjectPicture({ image, className, sizes, priority = false }: {
  image: ProjectImage;
  className: string;
  sizes: string;
  priority?: boolean;
}) {
  const asset = getImageAsset("project", image.src);
  const srcSet = (format: "avif" | "webp") => asset?.widths
    .map((width) => `${asset.base}/${width}.${format} ${width}w`).join(", ");

  return (
    <picture className={className} style={asset ? { backgroundImage: `url(${asset.blur})` } : undefined}>
      {asset ? <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} /> : null}
      {asset ? <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} /> : null}
      <img src={asset?.src || image.src} alt={image.alt} width={asset?.width} height={asset?.height}
        loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : undefined} />
    </picture>
  );
}
