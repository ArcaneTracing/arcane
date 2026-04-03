"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Copy } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger } from
'@/components/ui/context-menu';

import type { SpanAttribute } from '@/types/traces';

interface SpanAttributesTableProps {
  attributes: SpanAttribute[];
  onCopy: (text: string) => void;
  datasetMode?: boolean;
  datasetColumns?: string[];
  onMapToColumn?: (columnName: string, value: string, mode: 'add' | 'map') => void;
  mappedColumns?: Set<string>;
}

export function SpanAttributesTable({
  attributes,
  onCopy,
  datasetMode = false,
  datasetColumns = [],
  onMapToColumn,
  mappedColumns = new Set()
}: Readonly<SpanAttributesTableProps>) {
  const [selectedText, setSelectedText] = useState<string>('');
  const selectionRef = useRef<{value: string;key: string;} | null>(null);

  if (!attributes || attributes.length === 0) {
    return null;
  }

  const handleTextSelection = (e: React.MouseEvent, attr: SpanAttribute) => {
    const selection = globalThis.getSelection();
    const selectedText = selection?.toString().trim() || '';

    if (selectedText) {
      setSelectedText(selectedText);
      selectionRef.current = { value: selectedText, key: attr.key };
    } else {
      selectionRef.current = null;
    }
  };

  const handleMapToColumn = (columnName: string, value: string, mode: 'add' | 'map') => {
    if (onMapToColumn) {
      onMapToColumn(columnName, value, mode);
    }
  };

  const getAvailableColumns = () => {


    return datasetColumns;
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="border rounded-lg">
      <div className="p-3 border-b">
        <h4 className="text-sm font-medium">Attributes</h4>
      </div>
      <Table className="table-fixed">
        <TableBody>
          {attributes.map((attr) => {
            const attrKeyStr = String(attr.key);
            const attrValueStr = formatValue(attr.value);
            const availableColumns = getAvailableColumns();

            return (
              <TableRow key={attr.key}>
                <TableCell className="font-medium text-xs w-1/2 min-w-0 align-top">
                  <div className="overflow-auto max-h-32 min-w-0">
                    {datasetMode && onMapToColumn ?
                    <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div className="break-words break-all cursor-context-menu whitespace-pre-wrap">
                            {attrKeyStr}
                          </div>
                        </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => onCopy(attrKeyStr)}>
                          <Copy className="h-3 w-3 mr-2" />
                          Copy Key
                        </ContextMenuItem>
                        {availableColumns.length > 0 &&
                      <>
                            <ContextMenuSeparator />
                            <ContextMenuSub>
                              <ContextMenuSubTrigger>Add Key to Column</ContextMenuSubTrigger>
                              <ContextMenuSubContent>
                                {availableColumns.map((columnName) =>
                            <ContextMenuItem
                              key={columnName}
                              onClick={() => handleMapToColumn(columnName, attrKeyStr, 'add')}>

                                    {columnName}
                                  </ContextMenuItem>
                            )}
                              </ContextMenuSubContent>
                            </ContextMenuSub>
                            <ContextMenuSub>
                              <ContextMenuSubTrigger>Map Key to Column</ContextMenuSubTrigger>
                              <ContextMenuSubContent>
                                {availableColumns.map((columnName) =>
                            <ContextMenuItem
                              key={columnName}
                              onClick={() => handleMapToColumn(columnName, attrKeyStr, 'map')}>

                                    {columnName}
                                  </ContextMenuItem>
                            )}
                              </ContextMenuSubContent>
                            </ContextMenuSub>
                          </>
                      }
                      </ContextMenuContent>
                    </ContextMenu> :

                    <div className="break-words break-all">
                      {attrKeyStr}
                    </div>
                  }
                  </div>
                </TableCell>
                <TableCell className="text-xs w-1/2 min-w-0 align-top">
                  <div className="flex items-start gap-2">
                    {datasetMode && onMapToColumn ?
                    <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <button
                          type="button"
                          className="flex-1 min-w-0 max-h-32 overflow-auto cursor-context-menu text-left bg-transparent border-0 p-0 min-h-0"
                          style={{ userSelect: 'text' }}
                          onMouseUp={(e) => handleTextSelection(e, attr)}>

                            <pre className="text-xs whitespace-pre-wrap break-words font-sans select-text">
                              {attrValueStr}
                            </pre>
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => onCopy(attrValueStr)}>
                            <Copy className="h-3 w-3 mr-2" />
                            Copy Value
                          </ContextMenuItem>
                          {selectedText && selectionRef.current?.key === attr.key &&
                        <>
                              <ContextMenuSeparator />
                              <ContextMenuItem onClick={() => onCopy(selectedText)}>
                                <Copy className="h-3 w-3 mr-2" />
                                Copy Selected: "{selectedText.substring(0, 20)}{selectedText.length > 20 ? '...' : ''}"
                              </ContextMenuItem>
                              {availableColumns.length > 0 &&
                          <>
                                  <ContextMenuSeparator />
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger>Add Selected to Column</ContextMenuSubTrigger>
                                    <ContextMenuSubContent>
                                      {availableColumns.map((columnName) =>
                                <ContextMenuItem
                                  key={columnName}
                                  onClick={() => handleMapToColumn(columnName, selectedText, 'add')}>

                                          {columnName}
                                        </ContextMenuItem>
                                )}
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger>Map Selected to Column</ContextMenuSubTrigger>
                                    <ContextMenuSubContent>
                                      {availableColumns.map((columnName) =>
                                <ContextMenuItem
                                  key={columnName}
                                  onClick={() => handleMapToColumn(columnName, selectedText, 'map')}>

                                          {columnName}
                                        </ContextMenuItem>
                                )}
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>
                                </>
                          }
                            </>
                        }
                          {availableColumns.length > 0 &&
                        <>
                              <ContextMenuSeparator />
                              <ContextMenuSub>
                                <ContextMenuSubTrigger>Add Value to Column</ContextMenuSubTrigger>
                                <ContextMenuSubContent>
                                  {availableColumns.map((columnName) =>
                              <ContextMenuItem
                                key={columnName}
                                onClick={() => handleMapToColumn(columnName, attrValueStr, 'add')}>

                                      {columnName}
                                    </ContextMenuItem>
                              )}
                                </ContextMenuSubContent>
                              </ContextMenuSub>
                              <ContextMenuSub>
                                <ContextMenuSubTrigger>Map Value to Column</ContextMenuSubTrigger>
                                <ContextMenuSubContent>
                                  {availableColumns.map((columnName) =>
                              <ContextMenuItem
                                key={columnName}
                                onClick={() => handleMapToColumn(columnName, attrValueStr, 'map')}>

                                      {columnName}
                                    </ContextMenuItem>
                              )}
                                </ContextMenuSubContent>
                              </ContextMenuSub>
                            </>
                        }
                        </ContextMenuContent>
                      </ContextMenu> :

                    <div className="flex-1 min-w-0 max-h-32 overflow-auto">
                        <pre className="text-xs whitespace-pre-wrap break-words font-sans">
                          {attrValueStr}
                        </pre>
                      </div>
                    }
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0 mt-0.5"
                      onClick={() => onCopy(attrValueStr)}>

                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>);

          })}
        </TableBody>
      </Table>
    </div>);

}