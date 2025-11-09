import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { index as usersIndex, create as usersCreate } from '@/routes/admin/users';
import { type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { UsersTable, type User } from './components/users-table';

interface Props {
    users: Paginated<User>;
    filters: {
        search?: string;
        per_page: number;
    };
}

export default function UsersIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            usersIndex.url(),
            { search, per_page: filters.per_page },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const stats = useMemo(() => {
        const total = users.total;
        const admins = users.data.filter((u) => u.is_admin).length;
        const authorized = users.data.filter((u) => u.authorized).length;

        return { total, admins, authorized };
    }, [users]);

    return (
        <AppLayout>
            <Head title="Gestión de Usuarios" />

            <div className="space-y-6 px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Heading title="Gestión de Usuarios" />
                        <p className="mt-1 text-sm text-muted-foreground">
                            Administra los usuarios y sus permisos
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={usersCreate.url()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Usuario
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-sm text-muted-foreground">
                            Usuarios totales
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-2xl font-bold">{stats.admins}</div>
                        <div className="text-sm text-muted-foreground">
                            Administradores
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-2xl font-bold">
                            {stats.authorized}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Autorizados
                        </div>
                    </div>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por nombre o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit">Buscar</Button>
                </form>

                {/* Table */}
                <UsersTable data={users} />

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex justify-center">
                        <Pagination data={users} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
