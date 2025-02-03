import React from "react";
import TableListSidebar from "./schema/TableListSidebar";
import DesignerCanvas from "./schema/DesignerCanvas";

interface HomeProps {
  onTableAdd?: () => void;
  onTableMove?: (tableId: string, position: { x: number; y: number }) => void;
  onRelationshipCreate?: (relationship: {
    startTable: string;
    endTable: string;
    startColumn: string;
    endColumn: string;
  }) => void;
}

const Home = ({ onTableAdd, onTableMove, onRelationshipCreate }: HomeProps) => {
  const [addedTables, setAddedTables] = React.useState<string[]>([]);
  const [relationships, setRelationships] = React.useState<
    Array<{
      startTable: string;
      endTable: string;
      startColumn: string;
      endColumn: string;
    }>
  >([]);

  const handleTableAdd = (tableId: string) => {
    if (addedTables.includes(tableId)) {
      alert("This table has already been added to the canvas");
      return false;
    }
    setAddedTables((prev) => [...prev, tableId]);
    return true;
  };

  const handleTableRemove = (tableId: string) => {
    setAddedTables((prev) => prev.filter((id) => id !== tableId));
    setRelationships((prev) =>
      prev.filter(
        (rel) => rel.startTable !== tableId && rel.endTable !== tableId,
      ),
    );
  };

  const handleRelationshipCreate = (relationship: {
    startTable: string;
    endTable: string;
    startColumn: string;
    endColumn: string;
  }) => {
    setRelationships((prev) => [...prev, relationship]);
    onRelationshipCreate?.(relationship);
  };
  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Sidebar */}
      <div className="flex-none">
        <TableListSidebar
          onAddTable={onTableAdd}
          tables={[
            { id: "1", name: "users", columnCount: 5 },
            { id: "2", name: "products", columnCount: 7 },
            { id: "3", name: "orders", columnCount: 6 },
          ]}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <DesignerCanvas
          tables={[
            {
              id: "1",
              name: "Users",
              columns: [
                { name: "id", type: "uuid", isPrimary: true },
                { name: "email", type: "varchar" },
                { name: "created_at", type: "timestamp" },
              ],
            },
            {
              id: "2",
              name: "Products",
              columns: [
                { name: "id", type: "uuid", isPrimary: true },
                { name: "name", type: "varchar" },
                { name: "price", type: "decimal" },
              ],
            },
            {
              id: "3",
              name: "Orders",
              columns: [
                { name: "id", type: "uuid", isPrimary: true },
                { name: "product_id", type: "uuid" },
                { name: "quantity", type: "integer" },
              ],
            },
          ]}
          relationships={relationships}
          onTableMove={onTableMove}
          onRelationshipCreate={handleRelationshipCreate}
          onTableRemove={handleTableRemove}
          onTableAdd={handleTableAdd}
          addedTables={addedTables}
        />
      </div>
    </div>
  );
};

export default Home;
