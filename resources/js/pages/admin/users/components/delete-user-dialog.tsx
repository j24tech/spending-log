import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { destroy as usersDestroy } from '@/routes/admin/users';
import { router } from '@inertiajs/react';
import type { User } from './users-table';

interface Props {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({ user, open, onOpenChange }: Props) {
    const handleDelete = () => {
        router.delete(usersDestroy.url(user.id), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar este usuario?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Estás a punto de eliminar a{' '}
                        <span className="font-semibold">{user.name}</span> (
                        {user.email}). Esta acción no se puede deshacer.
                        {user.is_admin && (
                            <span className="mt-2 block text-destructive">
                                ⚠️ Este usuario es administrador.
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
