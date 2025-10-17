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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormEventHandler, useEffect } from 'react';
import InputError from '@/components/input-error';

interface Category {
  id: number;
  name: string;
}

interface ExpenseDetail {
  id: number;
  name: string;
  amount: string;
  quantity: string;
  observation: string | null;
  category_id: number;
}

interface Props {
  expenseId: number;
  detail: ExpenseDetail;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDetailDialog({ expenseId, detail, categories, open, onOpenChange }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: detail.name,
    amount: detail.amount,
    quantity: detail.quantity,
    observation: detail.observation || '',
    category_id: detail.category_id.toString(),
  });

  useEffect(() => {
    if (open) {
      setData({
        name: detail.name,
        amount: detail.amount,
        quantity: detail.quantity,
        observation: detail.observation || '',
        category_id: detail.category_id.toString(),
      });
    }
  }, [open, detail]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/expenses/${expenseId}/details/${detail.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const calculateSubtotal = () => {
    const amount = parseFloat(data.amount) || 0;
    const quantity = parseFloat(data.quantity) || 0;
    return (amount * quantity).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Detalle</DialogTitle>
          <DialogDescription>
            Modifica la información del ítem del gasto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-detail-name">Descripción *</Label>
              <Input
                id="edit-detail-name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Nombre del ítem"
              />
              <InputError message={errors.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-detail-category">Categoría *</Label>
              <Select
                value={data.category_id}
                onValueChange={(value) => setData('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={errors.category_id} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-detail-quantity">Cantidad *</Label>
                <Input
                  id="edit-detail-quantity"
                  type="number"
                  step="1"
                  min="1"
                  value={data.quantity}
                  onChange={(e) => setData('quantity', e.target.value)}
                />
                <InputError message={errors.quantity} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-detail-amount">Precio Unitario *</Label>
                <Input
                  id="edit-detail-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.amount}
                  onChange={(e) => setData('amount', e.target.value)}
                />
                <InputError message={errors.amount} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subtotal</Label>
              <Input
                value={`$${calculateSubtotal()}`}
                readOnly
                className="bg-muted font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-detail-observation">Observación</Label>
              <Textarea
                id="edit-detail-observation"
                value={data.observation}
                onChange={(e) => setData('observation', e.target.value)}
                placeholder="Descripción adicional (opcional)"
                rows={2}
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
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

