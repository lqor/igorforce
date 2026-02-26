"use client";

import clsx from "clsx";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
}

export function DataTable({ columns, rows, onRowClick, emptyMessage }: DataTableProps) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-sf-text-weak">
        {emptyMessage || "No records to display."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-sf-border bg-sf-cloud">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "px-4 py-2 text-left text-xs font-semibold text-sf-text-weak uppercase tracking-wider",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row._id || i}
              className={clsx(
                "border-b border-sf-border transition-colors",
                onRowClick && "cursor-pointer hover:bg-sf-row-hover"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={clsx("px-4 py-2.5 text-sm", col.className)}>
                  {col.render
                    ? col.render(row.data?.[col.key] ?? row[col.key], row)
                    : (row.data?.[col.key] ?? row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
