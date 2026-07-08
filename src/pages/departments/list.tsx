import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Search, Eye, Edit, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Department } from "@/types";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";

const DepartmentsList = () => {
  const [searchquery, setSearchQuery] = useState('');

  const permanentFilters = useMemo(() => {
    const filters = [];
    if (searchquery) {
      filters.push({ field: 'name', operator: 'contains' as const, value: searchquery });
    }
    return filters;
  }, [searchquery]);

  const tablePagination = useMemo(() => ({ pageSize: 10, mode: 'server' as const }), []);
  const tableSorters = useMemo(() => ({ initial: [{ field: 'id', order: 'desc' as const }] }), []);

  const departmentTable = useTable<Department>({
    columns: useMemo<ColumnDef<Department>[]>(() => [
      {
        id: 'code',
        accessorKey: 'code',
        size: 100,
        header: () => <p className="column-title ml-2">Code</p>,
        cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>
      },
      {
        id: 'name',
        accessorKey: 'name',
        size: 200,
        header: () => <p className="column-title">Name</p>,
        cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()}</span>,
      },
      {
        id: 'description',
        accessorKey: 'description',
        size: 300,
        header: () => <p className="column-title">Description</p>,
        cell: ({ getValue }) => <span className="truncate line-clamp-2">{getValue<string>()}</span>
      },
      {
        id: 'actions',
        accessorKey: 'id',
        size: 150,
        header: () => <p className="column-title">Actions</p>,
        cell: ({ getValue }) => {
          const id = getValue<number>();
          return (
            <div className="flex items-center gap-2">
              <ShowButton recordItemId={id} variant="outline" size="icon" title="View Details"><Eye className="h-4 w-4" /></ShowButton>
              <EditButton recordItemId={id} variant="outline" size="icon" title="Edit Department"><Edit className="h-4 w-4" /></EditButton>
              <DeleteButton recordItemId={id} variant="outline" size="icon" title="Delete Department"><Trash2 className="h-4 w-4 text-destructive" /></DeleteButton>
            </div>
          );
        }
      }
    ], []),
    refineCoreProps: {
      pagination: tablePagination,
      filters: {
        permanent: permanentFilters
      },
      sorters: tableSorters,
    }
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className='page-title'>Departments List</h1>
      <div className="intro-row">
        <p>Manage academic departments.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search departments..."
              className="pl-10 w-full"
              value={searchquery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <CreateButton />
          </div>
        </div>
      </div>
      <DataTable table={departmentTable} />
    </ListView>
  );
};

export default DepartmentsList;
