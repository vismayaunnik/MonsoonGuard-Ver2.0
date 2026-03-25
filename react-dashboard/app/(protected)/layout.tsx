import { AppHeader, UserPanel, CursorBackground } from "@/components/ui/app-header";
import { LocationModal } from "@/components/ui/LocationModal";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050d1f] flex flex-col relative">
      <CursorBackground />
      <AppHeader />
      <UserPanel />
      <LocationModal />
      <main className="flex-1 overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
