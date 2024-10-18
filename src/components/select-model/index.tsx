'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const models = [
  {
    label: 'Claude 3.5 Sonnet',
    value: 'claude-3-5-sonnet',
  },
  {
    label: 'GPT-4o Mini',
    value: 'gpt-4o-mini',
  },
]

type SelectModelProps = {
  value: string
  setValue: (value: string) => void
}

export function SelectModel(props: SelectModelProps) {
  const { value = 'claude-3-5-sonnet', setValue } = props
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-[145px] text-xs justify-between border-2"
        >
          {value
            ? models.find(models => models.value === value)?.label
            : 'Select model...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {models.map(models => (
                <CommandItem
                  key={models.value}
                  value={models.value}
                  onSelect={currentValue => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === models.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {models.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
