import { useDroppable } from '@dnd-kit/core'

export function Droppable(props: React.PropsWithChildren<{}>) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable',
  })

  const style = {
    backgroundColor: isOver ? 'red !important' : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  )
}