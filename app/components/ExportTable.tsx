"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

type ExportColumn<T> = {
  header: string;
  key: keyof T;
};

type ExportTableProps<T extends object> = {
  data: T[];
  columns: ExportColumn<T>[];
  fileName: string;
  disabled?: boolean;
};

export default function ExportTable<T extends object>({
  data,
  columns,
  fileName,
  disabled = false,
}: ExportTableProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const prepareData = () => {
  return data.map((item) => {
    const row: Record<string, unknown> = {};

    columns.forEach((column) => {
      const value = item[column.key];

      // Date ko string format me export karna
      if (column.header.toLowerCase().includes("date")) {
        if (value) {
          const date = new Date(String(value));

          if (!isNaN(date.getTime())) {
            row[column.header] = date.toLocaleDateString("en-GB");
          } else {
            row[column.header] = value;
          }
        } else {
          row[column.header] = "";
        }
      } else {
        row[column.header] = value;
      }
    });

    return row;
  });
};
  const exportToExcel = () => {
    if (!data.length) return;

    const worksheet = XLSX.utils.json_to_sheet(prepareData());

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Report"
    );

    XLSX.writeFile(
      workbook,
      `${fileName}.xlsx`
    );

    setIsOpen(false);
  };

  const exportToCSV = () => {
    if (!data.length) return;

    const worksheet = XLSX.utils.json_to_sheet(
      prepareData()
    );

    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setIsOpen(false);
  };

  return (
    <div className="relative">
      
      {/* Export Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || !data.length}
        className="inline-flex items-center gap-2 rounded-lg bg-[#17191d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export

        <svg
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">

          {/* Excel */}
          <button
            type="button"
            onClick={exportToExcel}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="text-lg">📊</span>
            Export Excel
          </button>

          {/* CSV */}
          <button
            type="button"
            onClick={exportToCSV}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="text-lg">📄</span>
            Export CSV
          </button>

        </div>
      )}
    </div>
  );
}