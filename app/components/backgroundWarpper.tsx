import { ReactNode } from "react";
import Image from "next/image";

export default function BackgroundWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <div className="absolute inset-0 -z-10">
        <Image
          src="/northern_lights_dark_upscaled.webp"
          alt="Background"
          priority
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
