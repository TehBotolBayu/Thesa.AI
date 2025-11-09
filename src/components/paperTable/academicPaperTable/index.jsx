import React, { useEffect, useState } from "react";
import "../styles.css";
import PaperTable from "..";

const notShowColumn = [
  "extract_data",
  "evaluation",
  "synthesize",
  "inclusion",
  "exclusion",
];

const AcademicPaperTable = ({
  tableData,
  selectedPapers,
  setSelectedPapers,
  paperColumnValuesMap,
  additionalColumn,
  triggerFetching,
  addPaperColumnValues,
}) => {
  const defaultColumn = [
    {
      header: "Title",
      key: "title",
      className: "w-1/4",
      render: (value, paperId) => (
        <div className="w-[320px] leading-relaxed font-medium">{value}</div>
      ),
    },
    {
      header: "Abstract",
      key: "abstract",
      className: "w-[480px] max-h-48",
      render: (value, paperId) => (
        <div className="w-[480px] max-h-48 overflow-y-auto ">{value}</div>
      ),
    },
    {
      header: "Open Access",
      key: "isOpenAccess",
      className: "w-1/8 text-center",
      render: (value, paperId) => (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {value ? (
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              )}
            </svg>
            {value ? "Yes" : "No"}
          </span>
        </div>
      ),
    },
    {
      header: "PDF URL",
      key: "pdfUrl",
      className: "w-1/6",
      render: (value, paperId) => (
        <>
          {value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-150 text-sm break-all"
            >
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
              <p className="text-sm whitespace-nowrap">View PDF</p>
            </a>
          )}
        </>
      ),
    },
    {
      header: "Authors",
      key: "authors",
      className: "w-1/6",
      render: (value, paperId) => (
        <div className="max-h-48 flex flex-wrap gap-1">
          {value.map((author, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {author}
            </span>
          ))}
        </div>
      ),
    },
  ];

  const [originalColumns, setOriginalColumns] = useState(defaultColumn);

  useEffect(() => {
    (() => {
      if (!additionalColumn || additionalColumn.length === 0) return;
      let processedAdditionalColumn = additionalColumn.map((column) => {
        if (notShowColumn.includes(column?.step)) {
          return null;
        }

        return {
          header: column.label,
          key: column.id,
          className: "",
          render: (value, paperId, map) => (
            <div className="w-[480px] max-h-48 overflow-y-auto ">
              {column?.isFetching ? "Fetching..." : ""}
              {map[paperId][column.id]
                ? map[paperId][column.id].value
                : ""}
            </div>
          ),
        };
      });

      processedAdditionalColumn = processedAdditionalColumn.filter(
        (column) => column !== null
      );

      const newColumns = [...defaultColumn, ...processedAdditionalColumn];
      setOriginalColumns(newColumns);
    })();
  }, [additionalColumn, paperColumnValuesMap]);

  // generate ai insgith after added new column to db and table_data where isFetching is true
  useEffect(() => {
    (async () => {
      const fetchedColumns = additionalColumn.find(
        (column) => column.isFetching
      );
      if (!fetchedColumns) return;
      const response = await fetch("/api/ai-analytic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          papersData: tableData,
          column: fetchedColumns,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI analytic");
      }
      const data = await response.json();

      
      const valuesData = data.data;
      
      addPaperColumnValues(valuesData);
      triggerFetching(fetchedColumns.id, false);
    })();
  }, [tableData, additionalColumn]);
  
  useEffect(() => {
    console.log("paperColumnValuesMap data in academicpapertable: ", paperColumnValuesMap);
  }, [paperColumnValuesMap]);
  
  return (
    <PaperTable
      tableRowData={tableData}
      selectedData={selectedPapers}
      setSelectedData={setSelectedPapers}
      cellRenderer={originalColumns}
      paperColumnValuesMap={paperColumnValuesMap}
    />
  );
};

export default AcademicPaperTable; 
