"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/",            label: "Dashboard"  },
  { href: "/insight",     label: "Insight"    },
  { href: "/compare",     label: "Compare"    },
  { href: "/calculator",  label: "Calculator" },
  { href: "/frontier",    label: "Frontier"   },
  { href: "/strategies",  label: "Strategies" },
]

export default function Nav() {
  const path = usePathname()

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center gap-8">
      <span className="text-white font-bold tracking-tight text-lg">folio</span>
      <div className="flex gap-6">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm transition-colors ${
              path === l.href
                ? "text-white font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
