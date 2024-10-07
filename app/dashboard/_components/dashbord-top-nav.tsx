"use client"

import { Button } from '@/components/ui/button'
import ModeToggle from '@/components/mode-toggle'
import { UserProfile } from '@/components/user-profile'
import { Plus, Play, BarChart, FileText, Zap, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function DashboardTopNav() {
  return (
    <header className="flex h-16 items-center gap-4 border-b px-6">
      <Link href="/dashboard" className="flex items-center">
        <Image src="/path-to-your-logo.png" alt="Logo" width={32} height={32} />
        <span className="ml-2 text-lg font-semibold">Your App Name</span>
      </Link>

      <Button variant="ghost" size="sm" className="ml-4">
        <Plus className="mr-2 h-4 w-4" />
        Add
      </Button>

      <div className="flex-1" />

      <nav className="flex items-center space-x-4">
        <Link href="/dashboard/start" className="flex items-center text-sm font-medium">
          <Play className="mr-2 h-4 w-4" />
          Start
        </Link>
        <Link href="/dashboard/analytics" className="flex items-center text-sm font-medium">
          <BarChart className="mr-2 h-4 w-4" />
          Analytics
        </Link>
        <Link href="/dashboard/posts" className="flex items-center text-sm font-medium">
          <FileText className="mr-2 h-4 w-4" />
          Posts
        </Link>
        <Link href="/dashboard/optimize" className="flex items-center text-sm font-medium">
          <Zap className="mr-2 h-4 w-4" />
          Optimize
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <UserProfile />
        <ModeToggle />
      </div>
    </header>
  )
}