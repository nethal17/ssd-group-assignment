"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function VersionSwitcher({ versions, defaultVersion }) {
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span>Version: {selectedVersion}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {versions.map((version) => (
          <DropdownMenuItem
            key={version}
            onClick={() => setSelectedVersion(version)}
            className="flex items-center justify-between"
          >
            {version}
            {version === selectedVersion && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
