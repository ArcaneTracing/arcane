import { Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EventFilters } from './use-event-filters';
import type { FilterOptions } from './use-filter-options';

interface FiltersSidebarProps {
  filters: EventFilters;
  filterOptions: FilterOptions;
  entityMap: Map<string, string>;
  onFilterChange: (filters: EventFilters) => void;
}
export function FiltersSidebar({
  filters,
  filterOptions,
  entityMap,
  onFilterChange
}: Readonly<FiltersSidebarProps>) {
  const updateFilter = (key: keyof EventFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value === '__all__' ? '' : value
    });
  };

  return (
    <div className="w-64 border-r border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#181818] flex flex-col">
      <div className="p-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold text-sm">Filters</h3>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {}
          {filterOptions.spanNames.length > 0 &&
          <div className="space-y-2">
              <Label htmlFor="span-name" className="text-xs">Span Name</Label>
              <Select
              value={filters.spanName || '__all__'}
              onValueChange={(value) => updateFilter('spanName', value)}>

                <SelectTrigger id="span-name" className="h-8 text-xs">
                  <SelectValue placeholder="All spans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All spans</SelectItem>
                  {filterOptions.spanNames.map((name) =>
                <SelectItem key={name} value={name}>{name}</SelectItem>
                )}
                </SelectContent>
              </Select>
            </div>
          }

          {}
          {filterOptions.serviceNames.length > 0 &&
          <div className="space-y-2">
              <Label htmlFor="service-name" className="text-xs">Service Name</Label>
              <Select
              value={filters.serviceName || '__all__'}
              onValueChange={(value) => updateFilter('serviceName', value)}>

                <SelectTrigger id="service-name" className="h-8 text-xs">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All services</SelectItem>
                  {filterOptions.serviceNames.map((name) =>
                <SelectItem key={name} value={name}>{name}</SelectItem>
                )}
                </SelectContent>
              </Select>
            </div>
          }

          {}
          {filterOptions.entityIds.length > 0 &&
          <div className="space-y-2">
              <Label htmlFor="entity" className="text-xs">Entity</Label>
              <Select
              value={filters.entityId || '__all__'}
              onValueChange={(value) => updateFilter('entityId', value)}>

                <SelectTrigger id="entity" className="h-8 text-xs">
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All entities</SelectItem>
                  {filterOptions.entityIds.map((id) =>
                <SelectItem key={id} value={id}>
                      {entityMap.get(id) || id}
                    </SelectItem>
                )}
                </SelectContent>
              </Select>
            </div>
          }

          {}
          {filterOptions.eventFieldKeys.length > 0 &&
          <div className="space-y-2">
              <Label htmlFor="event-field-key" className="text-xs">Event Field Key</Label>
              <Select
              value={filters.eventFieldKey || '__all__'}
              onValueChange={(value) => updateFilter('eventFieldKey', value)}>

                <SelectTrigger id="event-field-key" className="h-8 text-xs">
                  <SelectValue placeholder="All fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All fields</SelectItem>
                  {filterOptions.eventFieldKeys.map((key) =>
                <SelectItem key={key} value={key}>{key}</SelectItem>
                )}
                </SelectContent>
              </Select>
            </div>
          }
        </div>
      </ScrollArea>
    </div>);

}