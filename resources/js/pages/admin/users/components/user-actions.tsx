import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    edit as usersEdit,
    toggleAdmin as usersToggleAdmin,
    toggleAuthorization as usersToggleAuthorization,
} from '@/routes/admin/users';
import { router } from '@inertiajs/react';
import {
    MoreHorizontal,
    Pencil,
    Shield,
    ShieldOff,
    Trash2,
    UserCheck,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import { DeleteUserDialog } from './delete-user-dialog';
import type { User } from './users-table';

interface Props {
    user: User;
}

export function UserActions({ user }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleToggleAuthorization = () => {
        router.post(
            usersToggleAuthorization.url(user.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleToggleAdmin = () => {
        router.post(
            usersToggleAdmin.url(user.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => router.visit(usersEdit.url(user.id))}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleToggleAuthorization}>
                        {user.authorized ? (
                            <>
                                <UserX className="mr-2 h-4 w-4" />
                                Revocar autorización
                            </>
                        ) : (
                            <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Autorizar usuario
                            </>
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleToggleAdmin}>
                        {user.is_admin ? (
                            <>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Remover admin
                            </>
                        ) : (
                            <>
                                <Shield className="mr-2 h-4 w-4" />
                                Promover a admin
                            </>
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar usuario
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteUserDialog
                user={user}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            />
        </>
    );
}
