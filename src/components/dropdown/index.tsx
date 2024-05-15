import { useState } from 'react'
import useClickOutside from '@/helpers/hooks/useClickOutside'
import { faGear, faCheckCircle, faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export interface DropdownItem {
  label: string
  name: string
  selected: boolean
  disabled?: boolean
}

interface DropdownProps {
  label?: string
  icon?: 'gear'
  background: string
  color: string
  items: DropdownItem[]
  onItemPressed: (name: string) => void
}

const AVAILABLE_ICONS = {
  'gear': faGear
}

export default function Dropdown({
  label = '',
  icon = 'gear',
  color,
  background,
  items, onItemPressed
} : DropdownProps) {
  const [showing, setShowing] = useState(false)
  const clickOutsideRef = useClickOutside(() => setShowing(false))

  const renderIconOrLabel = () => {
    if (label && label.length > 0) {
      return label
    }

    const availableIcon = AVAILABLE_ICONS[icon]

    if (icon.length < 1 || !availableIcon) {
      return <></>
    }

    return <FontAwesomeIcon icon={availableIcon} />
  }

  const renderItemIcon = (item: DropdownItem) => {
    if (item.selected) {
      return (
        <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-geen-100" />
      )
    }

    return (
      <FontAwesomeIcon icon={faCheck} className="mr-2 text-zinc-200" />
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowing(old => !old)}
        className={`p-2 px-5 rounded-xl bg-${background} text-${color}`}>
          {renderIconOrLabel()}
      </button>

      {showing && (
        <div ref={clickOutsideRef} className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
          <div className="py-1" role="none">
            {items.map(item => (
              <a
                href="#"
                className={`mt-2 mb-2 text-gray-700 block px-4 py-2 text-sm ${item.selected ? 'text-green-400' : ''} ${item.disabled ? 'cursor-not-allowed' : ''}`}
                role="menuitem"
                key={item.name}
                onClick={() => {
                  if (item.disabled) return
                  onItemPressed(item.name)
                }}
              >
                {renderItemIcon(item)}
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
