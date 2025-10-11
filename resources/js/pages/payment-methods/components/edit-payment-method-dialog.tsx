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
import { FormEventHandler, useEffect } from 'react';
import InputError from '@/components/input-error';

interface PaymentMethod {
  id: number;
  name: string;
  observation: string | null;
}

interface Props {
  paymentMethod: PaymentMethod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPaymentMethodDialog({ paymentMethod, open, onOpenChange }: Props) {
  const { data, setData, put, processing, errors, reset } = useForm({
    name: paymentMethod.name,
    observation: paymentMethod.observation || '',
  });

  useEffect(() => {
    if (open) {
      setData({
        name: paymentMethod.name,
        observation: paymentMethod.observation || '',
      });
    }
  }, [open, paymentMethod]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/payment-methods/${paymentMethod.id}`, {
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
          <DialogTitle>Editar Método de Pago</DialogTitle>
          <DialogDescription>
            Modifica la información del método de pago.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              <InputError message={errors.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-observation">Observación</Label>
              <Textarea
                id="edit-observation"
                value={data.observation}
                onChange={(e) => setData('observation', e.target.value)}
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
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

