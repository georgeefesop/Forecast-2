"use client";

import * as React from "react";
import { Check, ChevronDown, Database } from "lucide-react"; // Database icon can be passed as prop
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface FilterOption {
    value: string;
    label: string;
}

interface FilterDropdownProps {
    label: string;
    icon?: React.ReactNode;
    options: FilterOption[];
    selectedValues: string[]; // Supports multiple selections
    onSelect: (value: string) => void;
    multiSelect?: boolean;
    align?: "start" | "end" | "center";
    className?: string;
    onClear?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function FilterDropdown({
    label,
    icon,
    options,
    selectedValues,
    onSelect,
    multiSelect = false,
    align = "start",
    className,
    onClear,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: FilterDropdownProps) {
    const isActive = selectedValues.length > 0;
    const [internalOpen, setInternalOpen] = React.useState(false);

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const setOpen = (newOpen: boolean) => {
        if (!isControlled) setInternalOpen(newOpen);
        controlledOnOpenChange?.(newOpen);
    };

    const lockedRef = React.useRef(false);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (!isOpen) {
            lockedRef.current = false;
        }
    }, [isOpen]);

    const handleMouseEnter = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!isOpen) setOpen(true);
    };

    const handleMouseLeave = () => {
        timerRef.current = setTimeout(() => {
            if (!lockedRef.current) {
                setOpen(false);
            }
        }, 1000);
    };

    const handleClick = (e: React.MouseEvent) => {
        if (isOpen) {
            if (lockedRef.current) {
                // Was locked, user wants to close
                setOpen(false);
                lockedRef.current = false;
            } else {
                // Was hovered open, user wants to lock it
                lockedRef.current = true;
            }
        } else {
            // Was closed, open and lock
            setOpen(true);
            lockedRef.current = true;
        }
    };

    // Close handler for when clicking outside (handled by Radix default, but we need to sync lock state)
    const onOpenChangeWrapper = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) lockedRef.current = false; // Reset lock on close
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={onOpenChangeWrapper} modal={false}>
            <DropdownMenuTrigger asChild>
                <button
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                    className={cn(
                        "group flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-primary cursor-pointer",
                        isActive
                            ? "bg-white text-text-primary border-text-primary shadow-sm hover:bg-[#EBE5DE]"
                            : "bg-text-primary text-text-inverse border-border-subtle hover:bg-[#EBE5DE] hover:text-text-primary data-[state=open]:bg-[#EBE5DE] data-[state=open]:text-text-primary",
                        className
                    )}
                >
                    {icon && (
                        <span className={cn("h-4 w-4 flex items-center justify-center", isActive ? "text-text-primary" : "text-text-inverse")}>
                            {icon}
                        </span>
                    )}

                    <span>
                        {isActive
                            ? (multiSelect ? `${label} (${selectedValues.length})` : options.find(o => o.value === selectedValues[0])?.label || label)
                            : `All ${label === "City" ? "Cities" : `${label}s`}`}
                    </span>

                    <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform duration-200 group-data-[state=open]:rotate-180", isActive ? "text-text-primary" : "text-text-inverse")} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={align}
                className="w-56 rounded-2xl p-2 bg-white border border-border-default shadow-xl z-[100]"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex items-center justify-between px-2 py-1.5 bg-bg-surface rounded-t-lg">
                    <DropdownMenuLabel className="p-0 text-xs font-bold text-text-tertiary uppercase tracking-wider">
                        Filter by {label}
                    </DropdownMenuLabel>
                    {isActive && onClear && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                                // Optional: Keep open or close? User probably wants to close if clearing?
                                // Or maybe keep open to verify it's gone. Let's keep consistent with interaction.
                                // If I don't close, it clears.
                            }}
                            className="text-[10px] font-bold text-text-tertiary hover:text-brand-accent transition-colors uppercase tracking-wider cursor-pointer outline-none"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator className="bg-border-subtle my-1" />
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar pt-1 space-y-0.5">
                    {/* All Option */}
                    {multiSelect ? (
                        <DropdownMenuCheckboxItem
                            checked={selectedValues.length === 0}
                            onCheckedChange={() => onClear?.()}
                            onSelect={(e) => {
                                e.preventDefault();
                                lockedRef.current = true;
                            }}
                            aria-selected={selectedValues.length === 0}
                            className={cn(
                                "rounded-lg pl-8 pr-3 py-2.5 text-sm font-medium text-text-primary focus:bg-[#EBE5DE] hover:bg-[#EBE5DE] cursor-pointer transition-colors data-[state=checked]:bg-[#EBE5DE] data-[state=checked]:text-text-primary"
                            )}
                        >
                            All {label === "City" ? "Cities" : `${label}s`}
                        </DropdownMenuCheckboxItem>
                    ) : (
                        <DropdownMenuItem
                            onClick={() => onClear?.()}
                            onSelect={(e) => {
                                e.preventDefault();
                                lockedRef.current = true;
                            }}
                            className={cn(
                                "rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary focus:bg-[#EBE5DE] hover:bg-[#EBE5DE] cursor-pointer transition-colors flex justify-between",
                                selectedValues.length === 0 && "bg-[#EBE5DE] text-text-primary"
                            )}
                        >
                            All {label === "City" ? "Cities" : `${label}s`}
                            {selectedValues.length === 0 && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                    )}

                    {multiSelect ? (
                        options.map((option) => (
                            <DropdownMenuCheckboxItem
                                key={option.value}
                                checked={selectedValues.includes(option.value)}
                                onCheckedChange={() => onSelect(option.value)}
                                onSelect={(e) => {
                                    e.preventDefault();
                                    lockedRef.current = true;
                                }}
                                className="rounded-lg pl-8 pr-3 py-2.5 text-sm font-medium text-text-primary focus:bg-[#EBE5DE] hover:bg-[#EBE5DE] cursor-pointer transition-colors data-[state=checked]:bg-[#EBE5DE] data-[state=checked]:text-text-primary"
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))
                    ) : (
                        options.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => onSelect(option.value)}
                                onSelect={(e) => {
                                    e.preventDefault();
                                    lockedRef.current = true;
                                }}
                                className={cn(
                                    "rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary focus:bg-[#EBE5DE] hover:bg-[#EBE5DE] cursor-pointer transition-colors flex justify-between",
                                    selectedValues.includes(option.value) && "bg-[#EBE5DE] text-text-primary"
                                )}
                            >
                                {option.label}
                                {selectedValues.includes(option.value) && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu >
    );
}
