import { DesktopGate } from "@/components/showroom/desktop-gate";

export default function TemplatesLayout({ children }: LayoutProps<"/">) {
  return <DesktopGate>{children}</DesktopGate>;
}
