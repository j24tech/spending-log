import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    expenseId: number;
    detailId: number;
    detailName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteDetailDialog({
    expenseId,
    detailId,
    detailName,
    open,
    onOpenChange,
}: Props) {
    const { delete: destroy, processing } = useForm();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(`/expenses/${expenseId}/details/${detailId}`, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Detalle</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas eliminar el ítem{' '}
                        <strong>{detailName}</strong>? Esta acción no se puede
                        deshacer y se actualizará el total del gasto.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit}>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={processing}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
