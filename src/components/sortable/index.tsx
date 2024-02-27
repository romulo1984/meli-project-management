import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function Sortable(props: React.PropsWithChildren<{ id: string }>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: props.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition,
  } : undefined

  return (
    <div ref={setNodeRef} style={style} {...attributes} className='flex gap-1'>
      <div {...listeners} className='w-[12px] bg-zinc-50 rounded-lg mb-4 shadow cursor-move'></div>
      {props.children}
    </div>
  )
}