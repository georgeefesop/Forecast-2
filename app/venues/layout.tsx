import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";

export default function VenuesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
