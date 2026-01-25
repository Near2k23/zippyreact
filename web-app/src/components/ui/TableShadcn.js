import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Checkbox, Button, TextField, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

export default function TableShadcn({ columns, data, renderActions, enableRowSelection = true, initialFilterColumn, onAdd, addButtonLabel, toolbarRight, columnsButtonLabel }){
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { t } = useTranslation();

  const selectionColumn = React.useMemo(() => enableRowSelection ? [{
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && true)}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 1,
  }] : [], [enableRowSelection]);

  const table = useReactTable({
    data,
    columns: [...selectionColumn, ...columns],
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  const resolveColumn = React.useCallback((id) => {
    if (!id) return null;
    return table.getAllLeafColumns().find((c) => c.id === id) || null;
  }, [table]);
  
  const filterCol = resolveColumn(initialFilterColumn);
  const filterValue = (filterCol?.getFilterValue?.() ?? '') + '';
  const open = Boolean(anchorEl);
  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {filterCol ? (
            <TextField
              size="small"
              placeholder={t('search')}
              value={filterValue}
              onChange={(e) => filterCol?.setFilterValue(e.target.value)}
              className="max-w-full sm:max-w-xs"
            />
          ) : null}
          {onAdd ? (
            <Button variant="outlined" onClick={onAdd} startIcon={<AddIcon/>} className="w-full sm:w-auto">
              {addButtonLabel || 'Add'}
            </Button>
          ) : null}
        </div>
        
        <div className="flex justify-end items-center gap-2">
          {toolbarRight || null}
          <Button variant="outlined" onClick={handleOpenMenu} endIcon={<MoreHorizIcon/>} className="w-full sm:w-auto">
            {columnsButtonLabel || 'Columnas'}
          </Button>
        </div>
        
        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
          {table.getAllLeafColumns().filter(c => c.getCanHide()).map((column) => (
            <MenuItem key={column.id} onClick={() => column.toggleVisibility(!column.getIsVisible())}>
              <Checkbox checked={column.getIsVisible()} />{column.id}
            </MenuItem>
          ))}
        </Menu>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <div className="hidden md:block">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                      {header.isPlaceholder ? null : (
                        <div
                          onClick={header.column.getToggleSortingHandler()}
                          className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer hover:text-blue-600' : 'cursor-default'}`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: '↑', desc: '↓' }[header.column.getIsSorted()] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                  {renderActions ? <th className="p-3 border-b border-gray-200 font-medium text-gray-700" /> : null}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    {renderActions ? <td className="p-3">{renderActions(row.original)}</td> : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={table.getAllLeafColumns().length + (renderActions ? 1 : 0)}>
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, rowIndex) => (
              <div key={row.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                {enableRowSelection && (
                  <div className="flex items-center mb-3">
                    <Checkbox
                      checked={row.getIsSelected()}
                      onChange={(e) => row.toggleSelected(!!e.target.checked)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.id === 'select') return null;
                    
                    return (
                      <div key={cell.id} className="flex flex-col sm:flex-row sm:items-center">
                        <span className="text-sm font-medium text-gray-600 sm:w-1/3 sm:pr-2">
                          {typeof cell.column.columnDef.header === 'string' 
                            ? cell.column.columnDef.header 
                            : cell.column.id}
                        </span>
                        <span className="text-sm text-gray-900 sm:w-2/3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                      </div>
                    );
                  })}
                  
                  {renderActions && (
                    <div className="pt-2 border-t border-gray-100 mt-3">
                      {renderActions(row.original)}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No results.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length}
        </div>
        <div className="flex gap-2">
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
            className="min-w-[80px]"
          >
            Previous
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
            className="min-w-[80px]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}


