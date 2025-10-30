'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, X } from "lucide-react";
import React, { useState } from "react";

const ColumnManagemet = ({ setIsShowManageColumn,
    columns = [],
    handlePostNewColumn,
 }) => {
    const [isAddColumn, setIsAddColumn] = useState(false);
    const [columnName, setColumnName] = useState("");
    const [columnInstruction, setColumnInstruction] = useState("");
  return (
    <div className="w-full h-full">
      <div className="flex flex-row gap-2 justify-start w-full">
        <Button onClick={() => setIsAddColumn(true)}>
          <Plus size={16} />
          Add Column
        </Button>
        <Button onClick={() => setIsShowManageColumn(false)}>
          <X size={16} />
          Cancel
        </Button>
      </div>
      {
        columns && columns.length && !isAddColumn ? (
          <div className="flex flex-row gap-2 justify-start w-full">
            {columns.map((column) => (
              <div key={column.id}>{column?.label}</div>
            ))}
          </div>
        ) : (
          <div>No columns found</div>
        )
      }
      {
        isAddColumn && (
          <div>
            <label htmlFor="columnName">Column Name</label>
            <Input type="text" placeholder="Column Name" id="columnName" value={columnName} onChange={(e) => setColumnName(e.target.value)} />
            
            <label htmlFor="columnInstruction">Column Instruction</label>
            <Input type="text" placeholder="Column Instruction" id="columnInstruction" value={columnInstruction} onChange={(e) => setColumnInstruction(e.target.value)} />
            
            <Button onClick={() => setIsAddColumn(false)}>
                <X size={16} />
                Cancel
            </Button>
            <Button onClick={() => handlePostNewColumn(columnName, columnInstruction)}>
                <Save size={16} />
                Save Column
            </Button>
          </div>
        )
      }
    </div>
  );
};

export default ColumnManagemet;
