import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/ui/Preloader"; 

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Preloader /> {/* Optional: Keep preloader only for main site */}
      <Header />
      {children}
      <Footer />
    </>
  );
}