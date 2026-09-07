import { siteConfig } from "@/siteConfig";

export function BackgroundLayer() {
  const configured = siteConfig.backgrounds[0];

  return (
    <div className="background-layer" aria-hidden="true">
      {configured ? (
        <div
          className="background-image"
          style={{ backgroundImage: `url(${configured})` }}
        />
      ) : null}
      <div className="background-mask" />
    </div>
  );
}
