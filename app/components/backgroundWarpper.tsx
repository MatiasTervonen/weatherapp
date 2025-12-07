import { ReactNode } from "react";
import Image from "next/image";
import bgImage from "@/public/northern_lights_dark_upscaled.webp";

export default function BackgroundWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <div className="absolute inset-0 -z-10">
        <Image
          src={bgImage}
          alt="Background"
          priority
          fill
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
