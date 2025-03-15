'use client';
import { Integration } from '@/@types/integration';
import revalidate from '@/api/action';
import { api } from '@/api/api';
import { Button } from '@nova/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@nova/ui/components/ui/dropdown-menu';
import { Input } from '@nova/ui/components/ui/input';
import { toast } from '@nova/ui/components/ui/sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nova/ui/components/ui/table';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Filter, MoreHorizontal, Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

type IntegrationTableProps = {
  integrations: Integration[];
};
export default function IntegrationTable({
  integrations,
}: IntegrationTableProps) {
  const { chatflowId } = useParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });
  const columns: ColumnDef<Integration>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:bg-transparent p-0'
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span>{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Platform',
      cell: ({ row }) => {
        const type = row.getValue('type');
        return <span>{type === 'FACEBOOK' ? 'Facebook' : 'Telegram'}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status');
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              status === 'ENABLED'
                ? 'bg-green-500 text-green-50'
                : 'bg-red-500 text-red-50'
            }`}
          >
            {status === 'ENABLED' ? 'Enabled' : 'Disabled'}
          </span>
        );
      },
    },
    {
      accessorKey: 'Actions',
      header: 'Actions',
      cell: ({ row }) => {
        const integration = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant={'ghost'}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleToggleIntegration(integration)}>
                {integration.status === 'ENABLED' ? 'Disable' : 'Enable'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteIntegration(integration)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const table = useReactTable({
    data: integrations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  const handleConnectFacebook = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/integration/facebook/connect?chatflowId=${chatflowId}&redirectUrl=${window.location.href}`;
  };

  const handleDeleteIntegration = async (integration: Integration) => {
    const res = await api.delete(`/integration/${integration.id}`);
    if (res.error) {
      toast.error('Failed to delete integration');
    } else {
      revalidate('integrations');
    }
  }

  const handleToggleIntegration = async (integration: Integration) => {
    const res = await api.patch(`/integration/${integration.id}`, {
      status: integration.status === 'ENABLED' ? 'DISABLED' : 'ENABLED',
    });
    if (res.error) {
      toast.error('Failed to toggle integration');
    } else {
      revalidate('integrations');
    }
  }
  return (
    <div className='space-y-4'>
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Button className="gap-2">
            <Filter size={20} />
            <span>Filter</span>
          </Button>
          <Input placeholder="Search" />
        </div>
        <Button className="gap-2" onClick={handleConnectFacebook}>
          <Plus size={20} />
          <span>New Page</span>
        </Button>
      </div>
      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">
              Showing {table.getPaginationRowModel().rows.length} of{' '}
              {table.getCoreRowModel().rows.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2 py-4">
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
    </div>
  );
}
