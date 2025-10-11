import { useForm } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormEventHandler } from 'react';

interface Expense {
  id: number;
  name: string;
}

interface Props {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteExpenseDialog({ expense, open, onOpenChange }: Props) {
  const { delete: destroy, processing } = useForm();

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    destroy(`/expenses/${expense.id}`, {
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
          <DialogTitle>Eliminar Gasto</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el gasto <strong>{expense.name}</strong>? 
            Esta acción no se puede deshacer.
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
            <Button type="submit" variant="destructive" disabled={processing}>
              Eliminar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

