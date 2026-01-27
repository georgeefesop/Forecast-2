"use client";

import { useActionState, useEffect } from "react";
import { submitVenueClaim, ClaimState } from "@/lib/actions/venue-claims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Inline Label if not exists
function FormLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
    return <label htmlFor={htmlFor} className="block text-sm font-medium text-text-secondary mb-1">{children}</label>;
}

const initialState: ClaimState = {};

export function ClaimForm({ venueId, venueName }: { venueId: string; venueName: string }) {
    const [state, formAction] = useActionState(submitVenueClaim, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            // toast.success(state.message);
            // Redirect to confirmation or venue page?
            // User spec says: Confirmation screen: "Claim request submitted"
            // I'll show a success state here replacing the form.
        }
    }, [state.success, state.message]);

    if (state.success) {
        return (
            <div className="text-center py-8">
                <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">Claim Request Submitted</h2>
                <p className="text-text-secondary mb-6">
                    We have received your claim for <strong>{venueName}</strong>. Our team will review your details and get back to you shortly.
                </p>
                <Link href="/venues">
                    <Button variant="outline">Back to Venues</Button>
                </Link>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="venueId" value={venueId} />

            {state.error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                    {state.error}
                </div>
            )}

            <div>
                <FormLabel htmlFor="role">Your Role at Venue</FormLabel>
                <select
                    id="role"
                    name="role"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="">Select a role...</option>
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="promoter">Promoter</option>
                    <option value="staff">Staff</option>
                </select>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text-primary border-b pb-2">Verification Details</h3>

                <div>
                    <FormLabel htmlFor="email">Business Email</FormLabel>
                    <Input id="email" name="email" type="email" placeholder="e.g. manager@venue.com" required />
                </div>

                <div>
                    <FormLabel htmlFor="phone">Phone Number</FormLabel>
                    <Input id="phone" name="phone" type="tel" placeholder="+357..." />
                </div>

                <div>
                    <FormLabel htmlFor="website">Official Website</FormLabel>
                    <Input id="website" name="website" type="url" placeholder="https://..." />
                </div>

                <div>
                    <FormLabel htmlFor="instagram">Instagram Handle/URL</FormLabel>
                    <Input id="instagram" name="instagram" type="text" placeholder="@venue" />
                </div>

                <div>
                    <FormLabel htmlFor="notes">Additional Notes</FormLabel>
                    <textarea
                        id="notes"
                        name="notes"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Any other details to help us verify your ownership..."
                    />
                </div>
            </div>

            <SubmitButton />
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Submitting..." : "Submit Claim Request"}
        </Button>
    );
}
