import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import MobileBar from "@/components/layout/MobileBar";
import SmoothScroll from "@/components/motion/SmoothScroll";
import PageTransition from "@/components/motion/PageTransition";
import Motion from "@/components/motion/Motion";
import Cursor from "@/components/motion/Cursor";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <SmoothScroll />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <MobileBar />
      <Cursor />
      <PageTransition />
      <Motion />
    </>
  );
}
