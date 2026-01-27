'use client';

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddToCalendarProps {
    event: {
        title: string;
        description?: string | null;
        start_at: Date | string;
        end_at?: Date | string | null;
        venue?: {
            name: string;
            city: string;
        };
        address_text?: string | null;
    };
}

export function AddToCalendar({ event }: AddToCalendarProps) {
    const handleAddToCalendar = () => {
        const title = encodeURIComponent(event.title);

        // Format dates as YYYYMMDDTHHmmSSZ (UTC)
        // For simplicity, we'll use formatting that Google Calendar accepts (ISO string usually works or formatted string)
        // Specifically: YYYYMMDDTHHmmSSZ

        const startDate = new Date(event.start_at);
        // If no end date, assume 2 hours duration
        const endDate = event.end_at ? new Date(event.end_at) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

        const formatDate = (date: Date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, "");
        };

        const startStr = formatDate(startDate);
        const endStr = formatDate(endDate);

        const details = encodeURIComponent(event.description || "");
        const location = encodeURIComponent(
            event.address_text ||
            (event.venue ? `${event.venue.name}, ${event.venue.city}` : "") ||
            "Limassol, Cyprus"
        );

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;

        window.open(url, '_blank');
    };

    return (
        <Button
            variant="outline"
            onClick={handleAddToCalendar}
            className="gap-2"
        >
            <CalendarPlus className="h-4 w-4" />
            Add to Calendar
        </Button>
    );
}
