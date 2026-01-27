"use client";

import * as React from "react";
import { Check, ChevronDown, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { FilterDropdown } from "./filter-dropdown";

const SOURCES = [
    { value: "more_com", label: "More.com" },
    { value: "rave_pulse", label: "Rave Pulse" },
    { value: "cyprus_underground", label: "Cyprus Underground" },
    { value: "soldout_ticketbox", label: "Soldout" },
    { value: "ticketbox", label: "Ticketbox" },
    { value: "rialto_interticket", label: "Rialto" },
    { value: "all_about_limassol", label: "All About Limassol" },
    { value: "limassol_municipality", label: "Limassol Municipality" },
    { value: "limassol_tourism", label: "Limassol Tourism" },
    { value: "limassol_marina", label: "Limassol Marina" },
];

export function SourceDropdown({ open, onOpenChange, counts = [] }: { open?: boolean; onOpenChange?: (open: boolean) => void; counts?: { value: string, count: number }[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const activeSources = React.useMemo(() => {
        const param = searchParams.get("sources");
        return param ? param.split(",") : [];
    }, [searchParams]);

    const toggleSource = (sourceId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        let newSources: string[];

        if (activeSources.includes(sourceId)) {
            newSources = activeSources.filter((id) => id !== sourceId);
        } else {
            newSources = [...activeSources, sourceId];
        }

        if (newSources.length > 0) {
            params.set("sources", newSources.join(","));
        } else {
            params.delete("sources");
        }

        const targetPath = pathname === "/" ? "/" : "/explore";
        router.replace(`${targetPath}?${params.toString()}`, { scroll: false });
    };

    const clearSources = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("sources");
        const targetPath = pathname === "/" ? "/" : "/explore";
        router.replace(`${targetPath}?${params.toString()}`, { scroll: false });
    };

    return (
        <FilterDropdown
            label="Source"
            options={SOURCES.map(source => {
                const count = counts.find(c => c.value === source.value || c.value === source.label)?.count;
                return {
                    ...source,
                    label: count ? `${source.label} (${count})` : source.label
                };
            })}
            selectedValues={activeSources}
            onSelect={toggleSource}
            multiSelect={true}
            onClear={clearSources}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
}

interface SourceDropdownProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
