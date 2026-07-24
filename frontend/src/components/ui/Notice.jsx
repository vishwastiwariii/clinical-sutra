import Button from './Button.jsx';

/** Centered empty / error state used by the list and the detail page. */
export default function Notice({ title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-[15px] text-muted">{title}</p>
      {description && <p className="max-w-md text-sm text-faint">{description}</p>}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </div>
  );
}
