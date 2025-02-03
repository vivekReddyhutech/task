import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TableItem {
  id: string;
  name: string;
  columnCount: number;
}

interface TableListSidebarProps {
  tables?: TableItem[];
  onTableDragStart?: (tableId: string) => void;
  onTableDragEnd?: () => void;
  onAddTable?: () => void;
}

const TableListSidebar = ({
  tables = [
    { id: "1", name: "users", columnCount: 5 },
    { id: "2", name: "products", columnCount: 7 },
    { id: "3", name: "orders", columnCount: 6 },
    { id: "4", name: "categories", columnCount: 3 },
  ],
  onTableDragStart,
  onTableDragEnd,
  onAddTable,
}: TableListSidebarProps) => {
  return (
    <Card className="w-[280px] h-full bg-white border-r">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2 mb-4">
          <Input placeholder="Search tables..." className="h-9" />
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button className="w-full" onClick={onAddTable}>
          Add New Table
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-116px)]">
        <div className="p-4 space-y-2">
          {tables.map((table) => (
            <div
              key={table.id}
              className="p-3 rounded-md border bg-card hover:bg-accent cursor-move"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("table", table.id);
                e.dataTransfer.effectAllowed = "copy";
                onTableDragStart?.(table.id);
              }}
              onDragEnd={onTableDragEnd}
            >
              <div className="font-medium">{table.name}</div>
              <div className="text-sm text-muted-foreground">
                {table.columnCount} columns
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TableListSidebar;
