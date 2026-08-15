import { Inbox, SearchX, AlertTriangle, type LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

type Variant = "no-data" | "no-results" | "error";

const VARIANT_ICON: Record<Variant, LucideIcon> = {
  "no-data": Inbox,
  "no-results": SearchX,
  error: AlertTriangle,
};

export function EmptyState({
  variant = "no-data",
  icon,
  title,
  description,
  action,
  className,
}: {
  variant?: Variant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  const Icon = icon ?? VARIANT_ICON[variant];
  const isError = variant === "error";

  return (
    <Card className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}>
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: isError ? "var(--danger-bg)" : "rgba(139,107,255,0.14)",
          color: isError ? "var(--danger)" : "var(--accent-violet)",
        }}
      >
        <Icon size={26} />
      </div>
      <div className="max-w-sm">
        <h3 className="font-display text-base font-semibold text-[var(--text)]">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-[var(--text-muted)]">{description}</p>}
      </div>
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </Card>
  );
}
