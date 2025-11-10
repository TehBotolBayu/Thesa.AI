"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, X, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

const ColumnManagement = ({
  setIsShowManageColumn,
  columns = [],
  handlePostNewColumn,
  setColumns = () => {},
}) => {
  const [isAddColumn, setIsAddColumn] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [columnInstruction, setColumnInstruction] = useState("");

  const handleToggleColumn = (columnId, currentShown) => {
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, shown: !currentShown } : col
      )
    );
  };

  const handleSaveColumn = () => {
    if (columnName.trim()) {
      handlePostNewColumn(columnName, columnInstruction);
      setColumnName("");
      setColumnInstruction("");
      setIsAddColumn(false);
    }
  };

  return (
    <div className="w-full h-full p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Manage Columns</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add new columns or toggle visibility of existing ones
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsShowManageColumn(false)}
            className="gap-2"
          >
            <X size={16} />
            Close
          </Button>
        </div>

        {/* Add Column Button */}
        {!isAddColumn && (
          <Button onClick={() => setIsAddColumn(true)} className="gap-2">
            <Plus size={16} />
            Add New Column
          </Button>
        )}

        {/* Add Column Form */}
        {isAddColumn && (
          <Card>
            <CardHeader>
              <CardTitle>New Column</CardTitle>
              <CardDescription>
                Create a new column with custom instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="columnName">Column Name</Label>
                <Input
                  type="text"
                  placeholder="Enter column name"
                  id="columnName"
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="columnInstruction">Column Instruction</Label>
                <Input
                  type="text"
                  placeholder="Enter column instruction (optional)"
                  id="columnInstruction"
                  value={columnInstruction}
                  onChange={(e) => setColumnInstruction(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveColumn}
                  className="gap-2"
                  disabled={!columnName.trim()}
                >
                  <Save size={16} />
                  Save Column
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddColumn(false);
                    setColumnName("");
                    setColumnInstruction("");
                  }}
                  className="gap-2"
                >
                  <X size={16} />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Columns List */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Columns</CardTitle>
            <CardDescription>
              Toggle visibility of columns in your view
            </CardDescription>
          </CardHeader>
          <CardContent>
            {columns && columns.length > 0 ? (
              <div className="space-y-3">
                {columns.filter((column) => column.step === null || column.step.trim() === "").map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {column?.label || column?.name || "Unnamed Column"}
                      </div>
                      {column?.instruction && (
                        <div className="text-sm text-gray-500 mt-1">
                          {column.instruction}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {column.shown !== false ? (
                          <Eye size={16} className="text-green-600" />
                        ) : (
                          <EyeOff size={16} className="text-gray-400" />
                        )}
                        <span className="min-w-[60px]">
                          {column.shown !== false ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      <Switch
                        checked={column.shown !== false}
                        onCheckedChange={() =>
                          handleToggleColumn(column.id, column.shown !== false)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium">No columns found</p>
                <p className="text-sm mt-1">
                  Click "Add New Column" to create your first column
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ColumnManagement;