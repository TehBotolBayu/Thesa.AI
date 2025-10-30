//create custom hook to handle chat data

"use client";

import { useState } from "react";

export function useColumn() {
  const [additionalColumn, setAdditionalColumn] = useState([]);
  const [paperColumnValuesMap, setPaperColumnValuesMap] = useState({});
  const [isFetching, setIsFetching] = useState(false);

  async function initData(chatbot_id, papers) {
    try {
      setIsFetching(true);
      const columns = await fetchColumns(chatbot_id);
      const values = await fetchColumnValues(chatbot_id);

      console.log("columns response data", JSON.stringify(columns, null, 2));
      
      setAdditionalColumn(columns);
      const map = mapListPaperColumnValues(papers, columns, values);
      setPaperColumnValuesMap(map);
      setIsFetching(false);
    } catch (err) {
      console.error("Error fetching columns:", err.message);
    } finally {
      setIsFetching(false);
    }
  }

  async function fetchColumns(chatbot_id) {
    try {
      const response = await fetch(
        `/api/paper-columns?chatbot_id=${chatbot_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch columns");
      }
      const columns = await response.json();
      return columns;
    } catch (err) {
      console.error("Error fetching columns:", err.message);
      return null;
    }
  }

  async function fetchColumnValues(chatbot_id) {
    try {
      const response = await fetch(
        `/api/paper-column-values?chatbot_id=${chatbot_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch column values");
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching column values:", err.message);
      return null;
    }
  }

  function mapListPaperColumnValues(papers, columns, values) {
    if(!papers || !columns || !values) return;
    const map = {};
    for (const paper of papers) {
      map[paper.id] = {};
      for (const column of columns) {
        map[paper.id][column.id] = values.find(
          (value) =>
            value.paper_id === paper.id && value.column_id === column.id
        );
      }
    }
    return map;
  }

  function addPaperColumnValues(values) {
    if(!values || values.length === 0) { console.log("addPaperColumnValues values is empty"); return};
    console.log("addPaperColumnValues values: ", JSON.stringify(values, null, 2));
    const newMap = {...paperColumnValuesMap};
    for (const value of values) {
      // Create a new object for the nested level to ensure React detects the change
      newMap[value.paper_id] = {
        ...newMap[value.paper_id],
        [value.column_id]: value
      };
    }
    setPaperColumnValuesMap(newMap);
  }

  async function postNewColumn(chatbot_id, columnName, columnInstruction) {
    try {
      const response = await fetch("/api/paper-columns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbot_id,
          label: columnName,
          instruction: columnInstruction,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create column");
      }

      const column = await response.json();
      console.log("column response data", JSON.stringify(column, null, 2))
      setAdditionalColumn((prevColumns) => [...prevColumns, {...column, isFetching: true}]);
      return column;
    } catch (err) {
      console.error("Error creating column:", err.message);
      return null;
    }
  }

  function triggerFetching(columnId, isFetching) {
    setAdditionalColumn((prevColumns) => prevColumns.map((column) => column.id === columnId ? {...column, isFetching: isFetching} : column));
  }

  return {
    additionalColumn,
    paperColumnValuesMap,
    fetchColumns,
    fetchColumnValues,
    mapListPaperColumnValues,
    addPaperColumnValues,
    initData,
    isFetching,
    postNewColumn,
    triggerFetching,
  };
}
