import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import SchemaTable from "./SchemaTable";
import RelationshipLine from "./RelationshipLine";

interface TablePosition {
  id: string;
  x: number;
  y: number;
}

interface Relationship {
  startTable: string;
  endTable: string;
  startColumn: string;
  endColumn: string;
}

interface DesignerCanvasProps {
  onTableRemove?: (tableId: string) => void;
  onTableAdd?: (tableId: string) => boolean;
  addedTables?: string[];
  tables?: Array<{
    id: string;
    name: string;
    columns: Array<{ name: string; type: string; isPrimary?: boolean }>;
  }>;
  relationships?: Relationship[];
  onTableMove?: (tableId: string, position: { x: number; y: number }) => void;
  onRelationshipCreate?: (relationship: Relationship) => void;
}

interface Table {
  id: string;
  name: string;
  columns: Array<{ name: string; type: string; isPrimary?: boolean }>;
}

const DesignerCanvas = ({
  tables = [],
  relationships = [],
  onTableMove,
  onRelationshipCreate,
  onTableRemove,
  onTableAdd,
  addedTables = [],
}: DesignerCanvasProps) => {
  const [tablePositions, setTablePositions] = useState<TablePosition[]>([]);
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
  const [draggingColumn, setDraggingColumn] = useState<{
    tableId: string;
    columnName: string;
  } | null>(null);
  const [tempLine, setTempLine] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleTableMove = (
    tableId: string,
    newPosition: { x: number; y: number },
  ) => {
    // Ensure position is within bounds
    const x = Math.max(0, newPosition.x);
    const y = Math.max(0, newPosition.y);

    // Update positions for all tables
    setTablePositions((prev) =>
      prev.map((pos) => (pos.id === tableId ? { ...pos, x, y } : pos)),
    );

    onTableMove?.(tableId, { x, y });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggingColumn && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setTempLine((prev) =>
        prev
          ? {
              ...prev,
              endX: e.clientX - rect.left,
              endY: e.clientY - rect.top,
            }
          : null,
      );
    }
    e.dataTransfer.dropEffect = "copy";
  };

  const findAvailablePosition = () => {
    const gridSize = { width: 300, height: 300 }; // Space needed for each table
    const positions = tablePositions.map((p) => ({ x: p.x, y: p.y }));

    // Start from top-left, try positions in a grid pattern
    let row = 0;
    let col = 0;
    let position = { x: 20, y: 20 };

    while (true) {
      // Check if this position overlaps with any existing table
      const overlaps = positions.some(
        (p) =>
          Math.abs(p.x - position.x) < gridSize.width &&
          Math.abs(p.y - position.y) < gridSize.height,
      );

      if (!overlaps) return position;

      // Move to next position in grid
      col++;
      position.x = 20 + col * (gridSize.width + 20);

      // If we've gone too far right, move to next row
      if (position.x > 1000) {
        col = 0;
        row++;
        position.x = 20;
        position.y = 20 + row * (gridSize.height + 20);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const tableId = e.dataTransfer.getData("table");
    if (tableId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, e.clientX - rect.left);
      const y = Math.max(0, e.clientY - rect.top);

      if (onTableAdd?.(tableId)) {
        setTablePositions((prev) => [...prev, { id: tableId, x, y }]);
      }
    }
  };

  const handleColumnDragStart = (
    tableId: string,
    columnName: string,
    e: React.DragEvent,
  ) => {
    e.stopPropagation();
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const position = tablePositions.find((p) => p.id === tableId);
    if (!position) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const columnIndex = table.columns.findIndex((c) => c.name === columnName);
    const startY = position.y + 80 + columnIndex * 40 + 20;

    setDraggingColumn({ tableId, columnName });
    setTempLine({
      startX: position.x + 280,
      startY,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
    });
  };

  const handleColumnDragEnd = (
    targetColumnName: string,
    e: React.DragEvent,
    targetTableId?: string,
  ) => {
    e.stopPropagation();
    if (
      draggingColumn &&
      targetTableId &&
      targetTableId !== draggingColumn.tableId
    ) {
      // Create the new relationship
      const newRelationship = {
        startTable: draggingColumn.tableId,
        endTable: targetTableId,
        startColumn: draggingColumn.columnName,
        endColumn: targetColumnName,
      };
      onRelationshipCreate?.(newRelationship);
    }
    setDraggingColumn(null);
    setTempLine(null);
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-slate-50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Relationship Lines */}
      {relationships.map((rel, index) => {
        const startPos = tablePositions.find((p) => p.id === rel.startTable);
        const endPos = tablePositions.find((p) => p.id === rel.endTable);
        const startTable = tables.find((t) => t.id === rel.startTable);
        const endTable = tables.find((t) => t.id === rel.endTable);

        if (!startPos || !endPos || !startTable || !endTable) return null;

        // Find column positions
        const startColIndex = startTable.columns.findIndex(
          (c) => c.name === rel.startColumn,
        );
        const endColIndex = endTable.columns.findIndex(
          (c) => c.name === rel.endColumn,
        );

        // Calculate exact column positions including vertical centering
        const startY = startPos.y + 80 + startColIndex * 40 + 20;
        const endY = endPos.y + 80 + endColIndex * 40 + 20;

        return (
          <RelationshipLine
            key={`${rel.startTable}-${rel.startColumn}-${rel.endTable}-${rel.endColumn}`}
            startX={startPos.x + 280} // Right edge of start table
            startY={startY}
            endX={endPos.x} // Left edge of end table
            endY={endY}
            isHighlighted={
              draggingColumn?.tableId === rel.startTable &&
              draggingColumn?.columnName === rel.startColumn
            }
          />
        );
      })}

      {/* Temporary Line while dragging */}
      {tempLine && <RelationshipLine {...tempLine} isDashed isHighlighted />}

      {/* Tables */}
      {tables
        .filter((table) => addedTables.includes(table.id))
        .map((table) => {
          const position = tablePositions.find((p) => p.id === table.id)!;

          return (
            <motion.div
              key={table.id}
              drag
              dragMomentum={false}
              dragElastic={0}
              dragConstraints={canvasRef}
              onDragEnd={(_, info) => {
                const newX = Math.max(0, position.x + info.offset.x);
                const newY = Math.max(0, position.y + info.offset.y);
                handleTableMove(table.id, { x: newX, y: newY });
              }}
              style={{
                position: "absolute",
                left: position.x,
                top: position.y,
                cursor: "move",
                zIndex: 10,
              }}
            >
              <SchemaTable
                tableName={table.name}
                columns={table.columns}
                onColumnDragStart={(columnName, e) =>
                  handleColumnDragStart(table.id, columnName, e)
                }
                onColumnDragEnd={(columnName, e) =>
                  handleColumnDragEnd(columnName, e, table.id)
                }
                onRemove={() => {
                  setTablePositions((prev) =>
                    prev.filter((p) => p.id !== table.id),
                  );
                  onTableRemove?.(table.id);
                }}
              />
            </motion.div>
          );
        })}
    </div>
  );
};

export default DesignerCanvas;
