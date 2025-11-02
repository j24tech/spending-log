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

interface Category {
    id: number;
    name: string;
}

interface Props {
    category: Category;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog({ category, open, onOpenChange }: Props) {
    const { showFlash } = useFlash();
    const { delete: destroy, processing } = useForm();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(`/categories/${category.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                showFlash('success', 'Categoría eliminada exitosamente');
            },
            onError: () => {
                showFlash('error', 'Error al eliminar la categoría');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Categoría</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas eliminar la categoría{' '}
                        <strong>{category.name}</strong>? Esta acción no se
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
