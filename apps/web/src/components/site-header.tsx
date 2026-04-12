'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@map-planner/ui';

const STRINOVA_SITE_ORIGIN = 'https://strinova.gg';
const GAME_URL = 'https://www.strinova.com/';

function HeaderNavLinks() {
  const pathname = usePathname();
  const mapsActive = pathname === '/' || pathname.startsWith('/planner');

  return (
    <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
      <Link
        href="/"
        className={cn(
          mapsActive ? 'text-foreground' : 'text-muted-foreground',
          'transition-colors hover:text-foreground',
        )}
      >
        Maps
      </Link>
      <a
        href={`${STRINOVA_SITE_ORIGIN}/creators`}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Creators
      </a>
      <a
        href={`${STRINOVA_SITE_ORIGIN}/news`}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        News
      </a>
      <a
        href={GAME_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-foreground"
      >
        Game
      </a>
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <a
          href={STRINOVA_SITE_ORIGIN}
          className="shrink-0 text-lg font-semibold tracking-tight transition-colors hover:text-primary"
        >
          Stringify
          <sup className="ml-1 align-super text-[0.55em] font-normal uppercase tracking-[0.18em] text-muted-foreground">
            [beta]
          </sup>
        </a>
        <HeaderNavLinks />
      </div>
    </header>
  );
}
