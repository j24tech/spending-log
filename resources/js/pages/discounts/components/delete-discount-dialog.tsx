import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useFlash } from '@/contexts/FlashContext';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Discount {
    id: number;
    name: string;
}

interface Props {
    discount: Discount;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteDiscountDialog({ discount, open, onOpenChange }: Props) {
    const { showFlash } = useFlash();
    const { delete: destroy, processing } = useForm();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(`/discounts/${discount.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                showFlash(
                    'success',
                    'Tipo de descuento eliminado exitosamente',
                );
            },
            onError: (errors) => {
                if (errors.discount) {
                    showFlash('error', errors.discount as string);
                } else {
                    showFlash(
                        'error',
                        'Error al eliminar el tipo de descuento',
                    );
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Tipo de Descuento</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas eliminar el tipo de
                        descuento <strong>{discount.name}</strong>? Esta acción
                        no se puede deshacer.
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
