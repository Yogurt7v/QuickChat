import styles from '../../styles/DragHandle.module.css';
type DragHandleProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners: any;
};

export default function DragHandle({ attributes, listeners }: DragHandleProps) {
  return (
    <div
      className={styles.dragHandle}
      {...attributes}
      {...listeners}
      onClick={e => e.stopPropagation()}
    >
      ⠿
    </div>
  );
}
