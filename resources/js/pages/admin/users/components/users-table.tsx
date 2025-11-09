import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { type Paginated } from '@/types';
import { UserActions } from './user-actions';

interface User {
    id: number;
    name: string;
    email: string;
    google_id: string | null;
    avatar: string | null;
    authorized: boolean;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    data: Paginated<User>;
}

export function UsersTable({ data }: Props) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Google OAuth</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">
                                No se encontraron usuarios
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.data.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="h-8 w-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                                {user.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </div>
                                        )}
                                        <span className="font-medium">
                                            {user.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    {user.is_admin ? (
                                        <Badge variant="default">
                                            Administrador
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Usuario
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {user.authorized ? (
                                        <Badge
                                            variant="outline"
                                            className="border-green-500 text-green-700 dark:text-green-400"
                                        >
                                            Autorizado
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="border-red-500 text-red-700 dark:text-red-400"
                                        >
                                            No autorizado
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {user.google_id ? (
                                        <Badge
                                            variant="outline"
                                            className="border-blue-500 text-blue-700 dark:text-blue-400"
                                        >
                                            Vinculado
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            No vinculado
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <UserActions user={user} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export type { User };
