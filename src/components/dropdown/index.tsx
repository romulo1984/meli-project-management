import React, { useState } from 'react'

export interface DropdownItem {
  label: string
  name: string
  value: string
  icon: string
}

interface DropdownProps {
  label: string
  icon: 'gear'
  background: string
  color: string
  items: DropdownItem[]
}

export default function Dropdown({ label, icon, color, background, items } : DropdownProps) {
  const [showing, setShowing] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowing(old => !old)}
        className={`p-2 rounded-lg bg-${background}-400 text-${color}-400`}>
        {label} {icon}
      </button>

      {showing && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
          <div className="py-1" role="none">
          
            <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-0">Account settings</a>
          </div>
        </div>
      )}
    </div>
  )
}
