import { flattenExtractedData } from "@/lib/dataUtil/systematicReviewExtraction";
import { useMemo, useState } from "react";
import "../styles.css";
import PaperTable from "..";
import MarkdownParser from "@/components/ui/markdownParser";

const SystematicLiteratureReviewPaperTable = ({
  tableRowData = [],
  paperData = [],
}) => {
  const [selectedData, setSelectedData] = useState([]);

  const { flattenedData, columnRenderer } = useMemo(() => {
    console.log("tableRowData: ", JSON.stringify(tableRowData, null, 2));
    console.log("paperData: ", JSON.stringify(paperData, null, 2));
    const flattenedData = tableRowData.map((item) => {
      const result = flattenExtractedData(item);
      const paper = paperData.find((p) => p.id === result.paperId);
      return {
        ...result,
         paper: paper?.title,
      };
    });
    console.log("flattenedData: ", JSON.stringify(flattenedData, null, 2));
    let columnRenderer = tableRowData?.[0].data.map((item) => ({
      header: item.label.charAt(0).toUpperCase() + item.label.slice(1),
      key: item.label.toLowerCase(),
      className: "w-1/6",
      render: (value, paperId) => (
        <div className="w-[480px] max-h-48 overflow-y-auto ">
          <MarkdownParser content={value} />
        </div>
      ),
    }));
    if(paperData.length > 0) {
      columnRenderer = [{
        header: "Paper",
        key: "paper",
        className: "w-1/6",
        render: (value, paperId) => <div className="w-[480px] max-h-48 overflow-y-auto ">{value}</div>,
      }, ...columnRenderer];
    }
    return {
      flattenedData,
      columnRenderer,
    };
  }, [tableRowData]);

  return (
    <PaperTable
      tableRowData={flattenedData}
      cellRenderer={columnRenderer}
    />
  );
};

export default SystematicLiteratureReviewPaperTable;
