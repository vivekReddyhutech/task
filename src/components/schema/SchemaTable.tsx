import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Grip, X, Plus } from "lucide-react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { motion } from "framer-motion";

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
  width?: number;
  height?: number;
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
  width = 280,
  height = 200,
}: SchemaTableProps) => {
  return (
    <div style={{ width, height }} className="relative">
      <Card className="bg-white shadow-lg select-none w-full h-full overflow-auto">
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
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
        onMouseDown={(e) => {
          e.stopPropagation();
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = width;
          const startHeight = height;

          const onMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            const newWidth = Math.max(200, Math.min(500, startWidth + deltaX));
            const newHeight = Math.max(
              150,
              Math.min(800, startHeight + deltaY),
            );
            onResize?.({ width: newWidth, height: newHeight });
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
      >
        <div className="absolute right-1 bottom-1 w-2 h-2 border-r-2 border-b-2 border-slate-400 hover:border-blue-500" />
      </div>
    </div>
  );
};

export default SchemaTable;
