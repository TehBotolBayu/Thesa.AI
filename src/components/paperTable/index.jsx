import React, { useEffect, useState, useMemo, use } from "react";
import "./styles.css";
import { usePaperData } from "@/hooks/usePaperData";

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
        <div className="leading-relaxed font-medium">{value}</div>
      ),
    },
    {
      header: "Abstract",
      key: "abstract",
      className: "w-2/5",
      render: (value, paperId) => (
        <div className="max-h-48 overflow-y-auto">{value}</div>
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
      console.log(
        "additionalColumn: ",
        JSON.stringify(additionalColumn, null, 2)
      );

      if (!additionalColumn || additionalColumn.length === 0) return;
      let processedAdditionalColumn = additionalColumn.map((column) => {
        if (notShowColumn.includes(column?.step)) {
          return null;
        }

        return {
          header: column.label,
          key: column.id,
          className: "",
          render: (value, paperId) => (
            <div className="w-[480px] max-h-48 overflow-y-auto ">
              {column?.isFetching ? "Fetching..." : ""}
              {paperColumnValuesMap[paperId][column.id]
                ? paperColumnValuesMap[paperId][column.id].value
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

      console.log("get AI analytic data", JSON.stringify(data, null, 2));
      const valuesData = data.data;
      console.log("valuesData: ", JSON.stringify(valuesData, null, 2));
      addPaperColumnValues(valuesData);
      triggerFetching(fetchedColumns.id, false);
    })();
  }, [tableData, additionalColumn]);

  return (
    <div className="bg-gray-50 overflow-x-auto overflow-y-hidden">
      {tableData && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white">
            <div className="">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    </th>
                    {originalColumns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${column.className}`}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {tableData.map((data) => (
                    <tr
                      key={data?.paperId || data.title}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td
                        className={`px-4 py-6 text-sm text-gray-900 align-top `}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPapers.includes(data.id)}
                          onChange={() =>
                            setSelectedPapers(
                              (prevSelected) =>
                                prevSelected.includes(data.id)
                                  ? prevSelected.filter((v) => v !== data.id) // uncheck → remove
                                  : [...prevSelected, data.id] // check → add
                            )
                          }
                        />
                      </td>
                      {originalColumns.map((column) => (
                        <td
                          key={column.key + data.id}
                          className={`px-4 py-6 text-sm text-gray-900 align-top ${column.className}`}
                        >
                          {column.render(data[column.key], data.id)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicPaperTable;
