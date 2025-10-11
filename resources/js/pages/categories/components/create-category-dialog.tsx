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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCategoryDialog({ open, onOpenChange }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    observation: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/categories', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
          <DialogDescription>
            Crea una nueva categoría para clasificar tus gastos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Alimentación, Transporte, etc."
              />
              <InputError message={errors.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observation">Observación</Label>
              <Textarea
                id="observation"
                value={data.observation}
                onChange={(e) => setData('observation', e.target.value)}
                placeholder="Descripción adicional (opcional)"
              />
              <InputError message={errors.observation} />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

