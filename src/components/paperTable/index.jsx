import React, { useEffect, useState } from "react";
import "./styles.css";

const notShowColumn = [
  "extract_data",
  "evaluation",
  "synthesize",
  "inclusion",
  "exclusion",
];

const PaperTable = ({
  tableRowData = [],
  selectedData = null,
  setSelectedData = null,
  cellRenderer,
  paperColumnValuesMap,
}) => {
  useEffect(() => {
    console.log(
      "tableRowData data in papertable: ",
      JSON.stringify(tableRowData, null, 2)
    );
  }, [tableRowData]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-auto overflow-y-hidden ">
      {tableRowData && (
        <div className="mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto overflow-y-hidden border border-gray-200">
            <div className="h-[calc(100vh-212px)] overflow-y-scroll">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-50 border-b border-gray-200">
                    {selectedData && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                    )}
                    {cellRenderer.map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${column.className}`}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {tableRowData.map((data, index) => (
                    <tr
                      key={data?.paperId || data.title}
                      className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-blue-50/30 transition-all duration-200"
                    >
                      {selectedData && (
                        <td
                          className={`px-6 py-6 text-sm text-gray-900 align-top`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedData.includes(data.id)}
                            onChange={() =>
                              setSelectedData(
                                (prevSelected) =>
                                  prevSelected.includes(data.id)
                                    ? prevSelected.filter((v) => v !== data.id) // uncheck → remove
                                    : [...prevSelected, data.id] // check → add
                              )
                            }
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      )}
                      {cellRenderer.map((column) => (
                        <td
                          key={column.key + data.id}
                          className={`px-6 py-6 text-sm text-gray-900 align-top ${column.className}`}
                        >
                          {column.render(
                            data[column.key],
                            data.id,
                            paperColumnValuesMap
                          )}
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

export default PaperTable;
