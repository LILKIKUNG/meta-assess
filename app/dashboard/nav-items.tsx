"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface NavItem {
    title: string
    href: string
    icon: LucideIcon
}

interface NavItemsProps {
    items: NavItem[]
    pathname: string
    role?: string
    onNavigate?: () => void
}

export function NavItems({ items, pathname, role, onNavigate }: NavItemsProps) {
    return (
        <div className="space-y-1">
            {items.filter(item => {
                if (item.href.includes('admin') && role !== 'admin') return false
                return true
            }).map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        pathname === item.href
                            ? "bg-blue-600/10 text-blue-500"
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                </Link>
            ))}
        </div>
    )
}
