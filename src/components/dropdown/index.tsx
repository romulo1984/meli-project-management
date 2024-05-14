import useClickOutside from '@/helpers/hooks/useClickOutside'
import { useState } from 'react'

export interface DropdownItem {
  label: string
  name: string
  selected: boolean
}

interface DropdownProps {
  label?: string
  icon?: 'gear' | ''
  background: string
  color: string
  items: DropdownItem[]
  onItemPressed: (name: string) => void
}

export default function Dropdown({
  label = '',
  icon = '',
  color,
  background,
  items, onItemPressed
} : DropdownProps) {
  const [showing, setShowing] = useState(false)
  const clickOutsideRef = useClickOutside(() => setShowing(false))

  return (
    <div className="relative">
      <button
        onClick={() => setShowing(old => !old)}
        className={`p-2 px-5 rounded-xl bg-${background}-800 text-${color}-800`}>
        {label} {icon}
      </button>

      {showing && (
        <div ref={clickOutsideRef} className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
          <div className="py-1" role="none">
            {items.map(item => (
              <a
                href="#"
                className={`mt-2 mb-2 text-gray-700 block px-4 py-2 text-sm ${item.selected ? 'bg-green-100' : ''}`}
                role="menuitem"
                key={item.name}
                onClick={() => onItemPressed(item.name)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
