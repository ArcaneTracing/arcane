import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatasourceResponse } from "@/types/datasources";
import { DatasourceSource } from "@/types/enums";
import { Database, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DatasourceSourceBadge } from "../badges/datasource-source-badge";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useOrganisationId } from "@/hooks/useOrganisation";


interface ClickHouseConfig {
  host: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  tableName: string;
  protocol?: 'http' | 'https';
}

interface DatasourceCardProps {
  datasource: DatasourceResponse;
  onEdit: (datasource: DatasourceResponse) => void;
  onDelete: (datasource: DatasourceResponse) => void;
}

export function DatasourceCard({ datasource, onEdit, onDelete }: Readonly<DatasourceCardProps>) {
  const organisationId = useOrganisationId();
  const getIconSrc = () => {
    switch (datasource.source) {
      case DatasourceSource.TEMPO:
        return '/images/tempo.png';
      case DatasourceSource.JAEGER:
        return '/images/jaeger.png';
      case DatasourceSource.CLICKHOUSE:

        return '/images/clickhouse.svg';
      case DatasourceSource.CUSTOM_API:
        return '/images/custom-api.png';
      default:

        return '';
    }
  };

  const formatConnectionString = () => {
    if (datasource.source === DatasourceSource.CLICKHOUSE && datasource.config?.clickhouse) {
      const ch = datasource.config.clickhouse as ClickHouseConfig;
      const auth = ch.username ? `${ch.username}@` : '';
      return `${ch.protocol || 'http'}://${auth}${ch.host}:${ch.port || 8123}/${ch.database}/${ch.tableName}`;
    }
    if (datasource.source === DatasourceSource.CUSTOM_API && datasource.config?.customApi) {
      const customApi = datasource.config.customApi as { baseUrl?: string };
      return customApi.baseUrl || datasource.url || '';
    }
    return datasource.url || '';
  };

  return (
    <Card className="border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                {getIconSrc() ?
                <img
                  src={getIconSrc()}
                  alt={datasource.source}
                  width={28}
                  height={28}
                  className="object-contain" /> :


                <Database className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                }
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <CardTitle className="text-base font-semibold line-clamp-1 text-gray-900 dark:text-gray-100 flex-1 min-w-0">
                  {datasource.name}
                </CardTitle>
                <DatasourceSourceBadge source={datasource.source} />
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {datasource.type}
                </Badge>
              </div>
              {datasource.description &&
              <CardDescription className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-1.5">
                  {datasource.description}
                </CardDescription>
              }
              <div className="flex items-center gap-2">
                
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate">
                  {formatConnectionString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-end gap-2">
          <PermissionGuard
            permission={PERMISSIONS.DATASOURCE.UPDATE}
            organisationId={organisationId}>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-[#1F1F1F]/80"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(datasource);
              }}>

              <span className="sr-only">Edit</span>
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={PERMISSIONS.DATASOURCE.DELETE}
            organisationId={organisationId}>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(datasource);
              }}>

              <span className="sr-only">Delete</span>
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      </CardContent>
    </Card>);

}