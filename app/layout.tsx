import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "folio",
  description: "Personal trading portfolio dashboard",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}>
        <Nav />
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
