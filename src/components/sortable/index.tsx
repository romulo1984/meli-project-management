import { useSortable } from '@dnd-kit/sortable'

export function Sortable(
  props: React.PropsWithChildren<{ id: string; disabled?: boolean }>,
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: props.id,
    disabled: props.disabled,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition,
  } : undefined

  return (
    <div ref={setNodeRef} style={style} {...attributes} className='flex gap-1'>
      <div
        {...listeners}
        className={`w-[12px] rounded-lg mb-4 shadow ${
          props.disabled
            ? 'bg-zinc-100 cursor-default'
            : 'bg-zinc-50 cursor-move'
        }`}
      ></div>
      {props.children}
    </div>
  )
}
