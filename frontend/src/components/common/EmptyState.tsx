import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && <span className="text-4xl mb-3">{icon}</span>}
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted mb-4">{description}</p>}
      {action && (
        <Button variant="secondary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
