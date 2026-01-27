"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/explore", label: "Events" },
  { href: "/map", label: "Map" },
  { href: "/venues", label: "Venues" },
  { href: "/saved", label: "Saved" },
  { href: "/submit", label: "Submit" },
  { href: "/account", label: "Account" },
];

export function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md supports-[backdrop-filter]:bg-bg-surface/60">
      <div className="mx-auto max-w-[1248px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-3xl font-medium tracking-tight text-text-primary group-hover:opacity-80 transition-opacity">Forecast</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-medium text-text-secondary transition-all hover:text-text-primary relative after:absolute after:left-0 after:bottom-[-4px] after:h-[1px] after:w-0 after:bg-text-primary after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
            <div className="pl-4 border-l border-border-subtle">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border-default py-4 md:hidden">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-base font-medium text-text-secondary transition-colors hover:text-text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
