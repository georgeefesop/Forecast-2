import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-background-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-fluid-lg font-bold text-text-primary">
              Forecast
            </Link>
            <p className="mt-2 text-sm text-text-secondary">
              Discover what's happening in Limassol, Cyprus
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Explore</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  All Events
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Map View
                </Link>
              </li>
              <li>
                <Link
                  href="/venues"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Venues
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary">About</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/submit"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Submit Event
                </Link>
              </li>
              <li>
                <Link
                  href="/advertise"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Advertise
                </Link>
              </li>
              <li>
                <Link
                  href="/newsletter"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Newsletter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border-default pt-8">
          <p className="text-sm text-text-tertiary">
            © {new Date().getFullYear()} Forecast. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
