import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FadeLayer = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-in-out",
        loaded ? "opacity-100" : "opacity-0",
      )}
    />
  );
};

/** Zeigt ein Bild und blendet bei Wechsel des Quellbilds ca. 300 ms weich über. */
const FadeImage = ({ src, alt }: { src: string; alt: string }) => {
  const [layers, setLayers] = useState([src]);

  useEffect(() => {
    setLayers((prev) => (prev[prev.length - 1] === src ? prev : [...prev.slice(-1), src]));
  }, [src]);

  useEffect(() => {
    if (layers.length < 2) return;
    const timer = setTimeout(() => setLayers((l) => l.slice(-1)), 400);
    return () => clearTimeout(timer);
  }, [layers]);

  return (
    <>
      {layers.map((layerSrc) => (
        <FadeLayer key={layerSrc} src={layerSrc} alt={alt} />
      ))}
    </>
  );
};

export default FadeImage;
