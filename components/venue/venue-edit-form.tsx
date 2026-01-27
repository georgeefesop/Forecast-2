"use client";

import { useActionState, useEffect } from "react";
import { updateVenue, VenueUpdateState } from "@/lib/actions/venues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import { Venue } from "@/lib/db/queries/venues";
import Link from "next/link";

// Inline Label
function FormLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
    return <label htmlFor={htmlFor} className="block text-sm font-medium text-text-secondary mb-1">{children}</label>;
}

const initialState: VenueUpdateState = {};

export function VenueEditForm({ venue }: { venue: Venue }) {
    const updateVenueWithId = updateVenue.bind(null, venue.id);
    const [state, formAction] = useActionState(updateVenueWithId, initialState);

    useEffect(() => {
        if (state.success) {
            // toast.success("Saved changes");
        }
    }, [state.success]);

    return (
        <form action={formAction} className="space-y-8">
            {state.error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                    {state.error}
                </div>
            )}
            {state.success && (
                <div className="p-3 bg-green-50 text-green-600 text-sm rounded-md border border-green-100">
                    {state.message}
                    <div className="mt-2 text-sm">
                        <Link href={`/venue/${venue.slug}`} className="underline font-medium">View Venue Page</Link>
                    </div>
                </div>
            )}

            {/* Identity */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary border-b pb-2">Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel htmlFor="name">Venue Name</FormLabel>
                        <Input id="name" name="name" defaultValue={venue.name} required />
                    </div>
                    <div>
                        <FormLabel htmlFor="type">Type</FormLabel>
                        {/* Enum: club/bar/theatre/gallery/restaurant/festival_site/community/other */}
                        <select
                            id="type"
                            name="type"
                            defaultValue={venue.type || ""}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Select type...</option>
                            <option value="club">Club</option>
                            <option value="bar">Bar</option>
                            <option value="theatre">Theatre</option>
                            <option value="gallery">Gallery</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="festival_site">Festival Site</option>
                            <option value="community">Community</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <FormLabel htmlFor="tags">Tags (comma separated)</FormLabel>
                    <Input id="tags" name="tags" defaultValue={venue.tags?.join(", ") || ""} placeholder="e.g. Techno, Rooftop, Cozy" />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary border-b pb-2">Description</h3>
                <div>
                    <FormLabel htmlFor="short_description">Short Description (1-2 lines)</FormLabel>
                    <Input id="short_description" name="short_description" defaultValue={venue.short_description || ""} />
                </div>
                <div>
                    <FormLabel htmlFor="about">About (Long description)</FormLabel>
                    <textarea
                        id="about"
                        name="about"
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        defaultValue={venue.about || ""}
                    />
                </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary border-b pb-2">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel htmlFor="city">City</FormLabel>
                        <select
                            id="city"
                            name="city"
                            defaultValue={venue.city}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="Limassol">Limassol</option>
                            <option value="Nicosia">Nicosia</option>
                            <option value="Larnaca">Larnaca</option>
                            <option value="Paphos">Paphos</option>
                            <option value="Ayia Napa">Ayia Napa</option>
                        </select>
                    </div>
                    <div>
                        <FormLabel htmlFor="area">Area / Neighborhood</FormLabel>
                        <Input id="area" name="area" defaultValue={venue.area || ""} />
                    </div>
                </div>
                <div>
                    <FormLabel htmlFor="address">Full Address</FormLabel>
                    <Input id="address" name="address" defaultValue={venue.address || ""} />
                </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary border-b pb-2">Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel htmlFor="website_url">Website</FormLabel>
                        <Input id="website_url" name="website_url" type="url" defaultValue={venue.website_url || ""} />
                    </div>
                    <div>
                        <FormLabel htmlFor="instagram_url">Instagram</FormLabel>
                        <Input id="instagram_url" name="instagram_url" defaultValue={venue.instagram_url || ""} />
                    </div>
                    <div>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <Input id="email" name="email" type="email" defaultValue={venue.email || ""} />
                    </div>
                    <div>
                        <FormLabel htmlFor="phone">Phone</FormLabel>
                        <Input id="phone" name="phone" type="tel" defaultValue={venue.phone || ""} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary border-b pb-2">Images</h3>
                <div>
                    <FormLabel htmlFor="images_text">Image URLs (one per line)</FormLabel>
                    <p className="text-xs text-text-secondary mb-2">
                        Paste direct links to images (hosted elsewhere) to display in your gallery.
                    </p>
                    <textarea
                        id="images_text"
                        name="images_text"
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        defaultValue={venue.images?.join('\n') || ""}
                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    />
                </div>
            </div>

            <div className="pt-4 border-t">
                <SubmitButton />
            </div>
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Changes"}
        </Button>
    );
}
