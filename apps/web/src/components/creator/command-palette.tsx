"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../ui/command"
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  FileText,
  Settings,
  Search,
} from "lucide-react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const pages = [
  {
    title: "Dashboard",
    href: "/creator/dashboard",
    icon: LayoutDashboard,
    shortcut: "⌘D",
  },
  {
    title: "Audience",
    href: "/creator/audience",
    icon: Users,
    shortcut: "⌘A",
  },
  {
    title: "Ideas",
    href: "/creator/ideas",
    icon: Lightbulb,
    shortcut: "⌘I",
  },
  {
    title: "Content",
    href: "/creator/content",
    icon: FileText,
    shortcut: "⌘C",
  },
  {
    title: "Settings",
    href: "/creator/settings",
    icon: Settings,
    shortcut: "⌘S",
  },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  const handleSelect = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search pages and navigate quickly"
      className="max-w-2xl bg-slate-900 border-slate-700 [&_[cmdk-group-heading]]:text-slate-400"
    >
      <CommandInput placeholder="Search pages, actions..." />
      <CommandList className="bg-slate-900">
        <CommandEmpty className="text-slate-400">No results found.</CommandEmpty>
        <CommandGroup heading="Pages" className="text-slate-300">
          {pages.map((page) => {
            const Icon = page.icon
            return (
              <CommandItem
                key={page.href}
                onSelect={() => handleSelect(page.href)}
                className="cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white data-[selected=true]:bg-[lab(33_35.57_-75.79)] data-[selected=true]:text-white"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{page.title}</span>
                {page.shortcut && (
                  <CommandShortcut className="text-slate-500">{page.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

