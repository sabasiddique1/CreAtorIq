import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from '../components/ui/toaster'
import "./globals.css"

// General Sans - using Inter as fallback (General Sans may need to be loaded via @font-face if custom)
const generalSans = Inter({ 
  subsets: ["latin"],
  variable: "--font-general-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "creAtor IQ",
  description: "AI-powered community insights and monetization for creators",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${generalSans.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
