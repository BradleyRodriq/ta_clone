import { SiteFooter } from "@/features/shell/SiteFooter";
import { SiteHeader } from "@/features/shell/SiteHeader";
import { DisclaimerBanner } from "@/features/shell/DisclaimerBanner";

export const dynamic = "force-dynamic";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <DisclaimerBanner />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
