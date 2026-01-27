import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getVenueById } from "@/lib/db/queries/venues";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { ClaimForm } from "@/components/organizer/claim-form";

export default async function ClaimVenuePage({ searchParams }: { searchParams: { venue?: string } }) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/organizer/claim");
  }

  const params = await Promise.resolve(searchParams);
  const venueId = params.venue;

  if (!venueId) {
    redirect("/venues"); // Or show error
  }

  const venue = await getVenueById(venueId);

  if (!venue) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-8 text-center">
          <h1 className="text-xl font-bold">Venue not found</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 bg-background-surface">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Claim Venue</h1>
            <p className="text-text-secondary">
              Take ownership of <strong>{venue.name}</strong> to manage events and update details.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm">
            <ClaimForm venueId={venue.id} venueName={venue.name} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
