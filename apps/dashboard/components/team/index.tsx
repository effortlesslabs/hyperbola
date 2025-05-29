import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Head } from "./head";

const data = [
  {
    id: "m5gr84i9",
    name: "Ken",
    email: "ken@gmail.com",
    role: "Admin",
    createdAt: "2023-10-01",
  },
  {
    id: "n6gr85j0",
    name: "Alice",
    email: "",
    role: "Member",
    createdAt: "2023-10-02",
  },
];

export function Team() {
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-1/2">
      <Head />
    </div>
  );
}
