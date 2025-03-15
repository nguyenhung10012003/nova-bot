'use client';
import { Source as SourceType } from '@/@types/source';
import { FileUpload } from '../file-upload';

import { Button } from '@nova/ui/components/ui/button';
import { Checkbox } from '@nova/ui/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@nova/ui/components/ui/dropdown-menu';
import { Input } from '@nova/ui/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nova/ui/components/ui/table';

import revalidate from '@/api/action';
import { api } from '@/api/api';
import { toast } from '@nova/ui/components/ui/sonner';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Search,
  Trash2,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const acceptFileTypes = `
    text/csv,
    application/vnd.openxmlformats-officedocument.wordprocessingml.document,
    application/pdf,
    application/json,
    application/vnd.openxmlformats-officedocument.presentationml.presentation,
    text/plain,
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  `;

interface FileItem {
  name: string;
  size?: string | number;
  url?: string;
  file?: File;
}

interface FilesTableProps {
  files: FileItem[];
  title?: string;
  onDeleteFile?: (file: FileItem, index: number) => void;
  onDeleteFiles?: (files: { file: FileItem; index: number }[]) => void;
  onSaveFiles?: (files: FileItem[]) => void;
}

export const FilesTable = ({
  files,
  title = 'Files',
  onDeleteFile,
  onDeleteFiles,
  onSaveFiles,
}: FilesTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<FileItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span>{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => {
        const size = row.getValue('size');
        return <span>{(size as string) || '-'}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const file = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(file.name)}
              >
                Copy name
              </DropdownMenuItem>
              <DropdownMenuItem>Download</DropdownMenuItem>
              {onDeleteFile && (
                <DropdownMenuItem
                  onClick={() => onDeleteFile(file, row.index)}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: files,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          {onDeleteFiles &&
            table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const selectedFiles = table
                    .getFilteredSelectedRowModel()
                    .rows.map((row) => ({
                      file: row.original,
                      index: row.index,
                    }));
                  onDeleteFiles(selectedFiles);
                }}
                className="gap-2"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            )}

          {onSaveFiles && (
            <Button
              onClick={() => onSaveFiles(files)}
              size="sm"
              className="gap-2"
            >
              <ArrowUp size={16} />
              Save
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} file(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function FileSource({ source }: { source?: SourceType }) {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const existingFiles = source?.files || [];
  const { sourceId } = useParams();

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    const newFiles = files.map((file) => ({
      name: file.name,
      size: formatFileSize(file.size),
      file: file,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleSaveFiles = async (files: FileItem[]) => {
    const formData = new FormData();

    existingFiles.forEach((file) => {
      formData.append('files', JSON.stringify(file));
    });
    files.forEach((file) => {
      if (file.file) formData.append('newFiles', file.file);
    });

    const res = await api.patch(`/sources/${sourceId}`, formData);
    if (res.error) {
      toast.error('Some thing went wrong');
    } else {
      revalidate(`source-${sourceId}`);
      setSelectedFiles([]);
    }
  };

  // Handle delete single file
  const handleDeleteSelectedFile = (file: FileItem, index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle delete multiple files
  const handleDeleteSelectedFiles = (
    files: { file: FileItem; index: number }[],
  ) => {
    setSelectedFiles((prev) =>
      prev.filter((_, i) => !files.some((file) => file.index === i)),
    );
  };

  const handleDeleteExsistingFile = async (file: FileItem, index: number) => {
    const newFileArray = existingFiles.filter((_, i) => i !== index);
    const res = await api.patch(`/sources/${sourceId}`, {
      files: newFileArray,
    });

    if (res.error) {
      toast.error('Some thing went wrong!');
    } else {
      revalidate(`source-${sourceId}`);
    }
  };

  const handleDeleteExsistingFiles = async (
    files: { file: FileItem; index: number }[],
  ) => {
    const newFileArray = existingFiles.filter(
      (_, i) => !files.some((file) => file.index === i),
    );
    const res = await api.patch(`/sources/${sourceId}`, {
      files: newFileArray,
    });

    if (res.error) {
      toast.error('Some thing went wrong!');
    } else {
      revalidate(`source-${sourceId}`);
    }
  };
  return (
    <>
      <FileUpload
        className="w-full"
        accept={acceptFileTypes}
        onUpload={handleFileUpload}
      />

      {/* Selected Files Table */}
      {selectedFiles.length > 0 && (
        <FilesTable
          files={selectedFiles}
          title="Selected Files"
          onDeleteFile={handleDeleteSelectedFile}
          onDeleteFiles={handleDeleteSelectedFiles}
          onSaveFiles={handleSaveFiles}
        />
      )}

      {/* Existing Files Table */}
      {existingFiles.length > 0 && (
        <FilesTable
          files={existingFiles}
          title="Existing Files"
          onDeleteFile={handleDeleteExsistingFile}
          onDeleteFiles={handleDeleteExsistingFiles}
        />
      )}

      {/* Show message if no files */}
      {selectedFiles.length === 0 && existingFiles.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No files selected. Upload files using the drag and drop area above.
        </div>
      )}
    </>
  );
}
