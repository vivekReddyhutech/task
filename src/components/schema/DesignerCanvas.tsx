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
}: DesignerCanvasProps) => {
  const [localTables, setLocalTables] = useState<Table[]>(tables);
  const [tablePositions, setTablePositions] = useState<TablePosition[]>([]);
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
    setTablePositions((prev) =>
      prev.map((pos) =>
        pos.id === tableId
          ? { ...pos, x: newPosition.x, y: newPosition.y }
          : pos,
      ),
    );
    onTableMove?.(tableId, newPosition);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("table")) {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const tableId = e.dataTransfer.getData("table");
    if (tableId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const table = tables.find((t) => t.id === tableId);
      if (table && onTableAdd?.(tableId)) {
        setTablePositions((prev) => [...prev, { id: tableId, x, y }]);
        setLocalTables((prev) => [...prev, table]);
      }
    }
  };

  const handleColumnDragStart = (
    tableId: string,
    columnName: string,
    e: React.DragEvent,
  ) => {
    setDraggingColumn({ tableId, columnName });
    const position = tablePositions.find((p) => p.id === tableId);
    if (position) {
      setTempLine({
        startX: position.x + 280,
        startY: position.y + 40,
        endX: e.clientX,
        endY: e.clientY,
      });
    }
  };

  const handleColumnDragEnd = (
    e: React.DragEvent,
    targetTableId: string,
    targetColumnName: string,
  ) => {
    if (draggingColumn && targetTableId !== draggingColumn.tableId) {
      onRelationshipCreate?.({
        startTable: draggingColumn.tableId,
        endTable: targetTableId,
        startColumn: draggingColumn.columnName,
        endColumn: targetColumnName,
      });
    }
    setDraggingColumn(null);
    setTempLine(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
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
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-slate-50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleCanvasMouseMove}
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

        if (!startPos || !endPos) return null;

        return (
          <RelationshipLine
            key={index}
            startX={startPos.x + 280}
            startY={startPos.y + 40}
            endX={endPos.x}
            endY={endPos.y + 40}
          />
        );
      })}

      {/* Temporary Line while dragging */}
      {tempLine && <RelationshipLine {...tempLine} isDashed isHighlighted />}

      {/* Tables */}
      {localTables.map((table) => {
        const position = tablePositions.find((p) => p.id === table.id) || {
          x: 0,
          y: 0,
        };

        return (
          <motion.div
            key={table.id}
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => {
              handleTableMove(table.id, {
                x: position.x + info.offset.x,
                y: position.y + info.offset.y,
              });
            }}
            style={{
              position: "absolute",
              left: position.x,
              top: position.y,
            }}
          >
            <SchemaTable
              tableName={table.name}
              columns={table.columns}
              onColumnDragStart={(columnName, e) =>
                handleColumnDragStart(table.id, columnName, e)
              }
              onColumnDragEnd={(columnName, e) =>
                handleColumnDragEnd(e, table.id, columnName)
              }
              onRemove={() => {
                setLocalTables((prev) => prev.filter((t) => t.id !== table.id));
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
