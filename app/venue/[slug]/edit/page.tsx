import { redirect, notFound } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getVenueBySlug } from "@/lib/db/queries/venues";
import { db } from "@/lib/db/client";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { VenueEditForm } from "@/components/venue/venue-edit-form";

interface VenueEditPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function VenueEditPage({ params }: VenueEditPageProps) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/auth/signin");
    }

    const { slug } = await params;
    const venue = await getVenueBySlug(slug);

    if (!venue) {
        notFound();
    }

    // Check permissions
    // Fetch admin status
    const profile = await db.query('SELECT is_admin FROM profiles WHERE user_id = $1', [session.user.id]);
    const isUserAdmin = profile.rows[0]?.is_admin;

    if (venue.claimed_by_user_id !== session.user.id && !isUserAdmin) {
        // Allow viewing but maybe show "Unauthorized"?
        // Or just redirect.
        return (
            <div className="flex min-h-screen flex-col">
                <MainNav />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8 bg-red-50 rounded-xl border border-red-100">
                        <h1 className="text-xl font-bold text-red-800">Permission Denied</h1>
                        <p className="text-red-600 mt-2">You do not have permission to edit this venue.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1 bg-background-surface">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-text-primary mb-6">Edit Venue: {venue.name}</h1>
                    <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm">
                        <VenueEditForm venue={venue} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
