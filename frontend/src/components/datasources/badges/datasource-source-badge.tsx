import { cn } from "@/lib/utils"
import { DatasourceSource } from "@/types/enums"

interface DatasourceSourceBadgeProps {
  source: DatasourceSource
}

export function DatasourceSourceBadge({ source }: Readonly<DatasourceSourceBadgeProps>) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium";
  
  const sourceStyles = {
    tempo: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
    jaeger: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    clickhouse: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400",
    custom_api: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    default: "bg-gray-50 text-gray-700 dark:bg-[#1F1F1F] dark:text-gray-400"
  };

  const styles = sourceStyles[source as unknown as keyof typeof sourceStyles] || sourceStyles.default;

  return (
    <span className={cn(baseStyles, styles)}>
      {source}
    </span>
  );
}

