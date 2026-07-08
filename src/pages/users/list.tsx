import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types";
import { useMemo, useState } from "react";
import { EditButton } from "@/components/refine-ui/buttons/edit.tsx";
import { DeleteButton } from "@/components/refine-ui/buttons/delete.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, Edit, Trash2, Eye } from "lucide-react";
import { useGetIdentity } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { UserProfileDialog } from "@/components/user-profile-dialog";

const UsersList = () => {
    const { data: identity } = useGetIdentity<User>();
    const role = identity?.role || "guest";
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const columns = useMemo<ColumnDef<User>[]>(() => [
        {
            id: 'avatar',
            accessorKey: 'image',
            header: '',
            cell: ({ getValue }) => {
                const image = getValue<string>();
                return (
                    <Avatar>
                        <AvatarImage src={image} className="object-cover" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                );
            }
        },
        {
            id: 'name',
            accessorKey: 'name',
            header: () => <p className="column-title">Name</p>,
        },
        {
            id: 'email',
            accessorKey: 'email',
            header: () => <p className="column-title">Email</p>,
        },
        {
            id: 'role',
            accessorKey: 'role',
            header: () => <p className="column-title">Role</p>,
            cell: ({ getValue }) => {
                const roleName = getValue<string>();
                const color = roleName === 'admin' ? 'default' : roleName === 'teacher' ? 'secondary' : 'outline';
                return <Badge variant={color} className="capitalize">{roleName}</Badge>;
            }
        },
        {
            id: 'actions',
            accessorKey: 'id',
            header: () => <p className="column-title">Actions</p>,
            cell: ({ row, getValue }) => {
                const userId = getValue() as string;
                return (
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            title="View Profile" 
                            onClick={() => setSelectedUser(row.original)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        {role === 'admin' && (
                            <>
                                <EditButton recordItemId={userId} variant="outline" size="icon" title="Edit User">
                                    <Edit className="h-4 w-4" />
                                </EditButton>
                                <DeleteButton recordItemId={userId} variant="outline" size="icon" title="Delete User">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </DeleteButton>
                            </>
                        )}
                    </div>
                );
            }
        }
    ], [role]);

    const permanentFilters = useMemo(() => {
        const filters = [];
        if (roleFilter !== 'all') filters.push({ field: 'role', operator: 'eq' as const, value: roleFilter });
        if (search) filters.push({ field: 'name', operator: 'contains' as const, value: search });
        return filters;
    }, [roleFilter, search]);

    const table = useTable<User>({
        columns,
        refineCoreProps: {
            filters: {
                permanent: permanentFilters
            }
        }
    });

    return (
        <ListView>
            <Breadcrumb />
            <h1 className='page-title'>Users List</h1>
            <div className="intro-row">
                <p>Manage all students, teachers, and admins in the system.</p>
                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <Input 
                            placeholder="Search by name or email..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <DataTable table={table} />

            {/* Profile Dialog Details Popup */}
            <UserProfileDialog 
                user={selectedUser} 
                open={selectedUser !== null} 
                onOpenChange={(open) => !open && setSelectedUser(null)} 
            />
        </ListView>
    );
};

export default UsersList;

