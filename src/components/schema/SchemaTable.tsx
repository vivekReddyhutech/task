import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Grip, X, Plus } from "lucide-react";

interface Column {
  name: string;
  type: string;
  isPrimary?: boolean;
}

interface SchemaTableProps {
  tableName?: string;
  columns?: Column[];
  position?: { x: number; y: number };
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onColumnDragStart?: (columnName: string, e: React.DragEvent) => void;
  onColumnDragEnd?: (columnName: string, e: React.DragEvent) => void;
  onRemove?: () => void;
}

const SchemaTable = ({
  tableName = "New Table",
  columns = [
    { name: "id", type: "uuid", isPrimary: true },
    { name: "name", type: "varchar" },
    { name: "created_at", type: "timestamp" },
  ],
  position = { x: 100, y: 100 },
  onMove,
  onResize,
  onColumnDragStart,
  onColumnDragEnd,
  onRemove = () => {},
}: SchemaTableProps) => {
  return (
    <Card
      className="bg-white shadow-lg select-none"
      style={{
        width: "280px",
        minHeight: "200px",
      }}
    >
      {/* Table Header */}
      <div className="p-4 border-b bg-slate-50 cursor-move flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grip className="h-4 w-4 text-slate-500" />
          <Input value={tableName} className="h-7 w-[160px] font-medium" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Columns List */}
      <div className="p-2 space-y-1">
        {columns.map((column, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer"
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const yOffset = e.clientY - rect.top;
              e.dataTransfer.setData(
                "columnData",
                JSON.stringify({
                  tableId: tableName,
                  columnName: column.name,
                  yOffset,
                }),
              );
              onColumnDragStart?.(column.name, e);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("bg-blue-100");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("bg-blue-100");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove("bg-blue-100");
              onColumnDragEnd?.(column.name, e);
            }}
          >
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm font-medium">{column.name}</span>
              <Badge variant="secondary" className="text-xs">
                {column.type}
              </Badge>
              {column.isPrimary && (
                <Badge variant="default" className="text-xs">
                  PK
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add Column Button */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>
    </Card>
  );
};

export default SchemaTable;
