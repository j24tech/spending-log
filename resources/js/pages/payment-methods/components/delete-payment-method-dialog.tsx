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

interface PaymentMethod {
    id: number;
    name: string;
}

interface Props {
    paymentMethod: PaymentMethod;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeletePaymentMethodDialog({
    paymentMethod,
    open,
    onOpenChange,
}: Props) {
    const { showFlash } = useFlash();
    const { delete: destroy, processing } = useForm();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(`/payment-methods/${paymentMethod.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                showFlash('success', 'Método de pago eliminado exitosamente');
                onOpenChange(false);
            },
            onError: () => {
                showFlash('error', 'Error al eliminar el método de pago');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Método de Pago</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas eliminar el método de pago{' '}
                        <strong>{paymentMethod.name}</strong>? Esta acción no se
                        puede deshacer.
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
