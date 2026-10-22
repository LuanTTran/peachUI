import Image from "next/image";
import { cx } from "@/lib/utils";

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/peach.webp"
      alt="PeachUI"
      width={size}
      height={size}
      className={cx("shrink-0", className)}
      style={{ width: size, height: size }}
      priority
    />
  );
}
