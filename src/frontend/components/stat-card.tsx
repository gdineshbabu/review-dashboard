import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/frontend/components/ui/card";

/** A single summary metric tile for the dashboard header. */
export const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) => {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary)]">
          <Icon className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {label}
          </p>
          <p className="text-2xl font-bold leading-tight">{value}</p>
          {hint && (
            <p className="truncate text-xs text-[var(--color-muted-foreground)]">
              {hint}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
