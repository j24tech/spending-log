import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormEventHandler, useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Plus, Trash2, Upload, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';

interface Category {
  id: number;
  name: string;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface ExpenseDetail {
  id?: number; // Optional, only exists for existing details
  name: string;
  amount: string;
  quantity: string;
  observation: string;
  category_id: string;
  _destroy?: boolean; // Mark for deletion
}

interface Props {
  categories: Category[];
  paymentMethods: PaymentMethod[];
  expense?: {
    id: number;
    name: string;
    expense_date: string;
    observation: string | null;
    document_number: string | null;
    document_path: string | null;
    payment_method_id: number;
    discount: number;
    expense_details: Array<{
      id: number;
      name: string;
      amount: string;
      quantity: string;
      observation: string | null;
      category_id: number;
    }>;
  };
}

export function ExpenseForm({ categories, paymentMethods, expense }: Props) {
  const isEditing = !!expense;

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for input[type="date"] (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Otherwise, parse and format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const { data, setData, post, put, processing, errors } = useForm({
    name: expense?.name || '',
    expense_date: formatDateForInput(expense?.expense_date) || getCurrentDate(),
    observation: expense?.observation || '',
    document_number: expense?.document_number || '',
    document: null as File | null,
    payment_method_id: expense?.payment_method_id.toString() || '',
    discount: expense?.discount?.toString() || '0',
    details: expense?.expense_details.map(d => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      quantity: d.quantity,
      observation: d.observation || '',
      category_id: d.category_id.toString(),
      _destroy: false,
    })) || [
      { name: '', amount: '', quantity: '1', observation: '', category_id: '', _destroy: false }
    ] as ExpenseDetail[],
  });

  const [fileName, setFileName] = useState<string>('');
  const [discountError, setDiscountError] = useState<string>('');

  // Validate discount whenever it or details change
  useEffect(() => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(data.discount) || 0;
    
    if (discount > subtotal) {
      setDiscountError(`El descuento no puede ser mayor que el subtotal del gasto ($${subtotal.toFixed(2)}).`);
    } else {
      setDiscountError('');
    }
  }, [data.discount, data.details]);

  const addDetail = () => {
    setData('details', [
      ...data.details,
      { name: '', amount: '', quantity: '1', observation: '', category_id: '', _destroy: false }
    ]);
  };

  const removeDetail = (index: number) => {
    const detail = data.details[index];
    
    // If it's an existing detail (has id), mark for deletion instead of removing
    if (detail.id) {
      const newDetails = [...data.details];
      newDetails[index] = { ...detail, _destroy: true };
      setData('details', newDetails);
    } else {
      // If it's a new detail, remove it from the array
      const newDetails = data.details.filter((_, i) => i !== index);
      setData('details', newDetails.length > 0 ? newDetails : [
        { name: '', amount: '', quantity: '1', observation: '', category_id: '', _destroy: false }
      ]);
    }
  };

  const restoreDetail = (index: number) => {
    const newDetails = [...data.details];
    newDetails[index] = { ...newDetails[index], _destroy: false };
    setData('details', newDetails);
  };

  const updateDetail = (index: number, field: keyof ExpenseDetail, value: string) => {
    const newDetails = [...data.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setData('details', newDetails);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('document', file);
      setFileName(file.name);
    }
  };

  const calculateSubtotal = () => {
    return data.details
      .filter(detail => !detail._destroy)
      .reduce((sum, detail) => {
        const amount = parseFloat(detail.amount) || 0;
        const quantity = parseFloat(detail.quantity) || 0;
        return sum + (amount * quantity);
      }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(data.discount) || 0;
    return Math.max(0, subtotal - discount);
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    
    // Prevent submission if there's a discount error
    if (discountError) {
      return;
    }
    
    if (isEditing && expense) {
      put(`/expenses/${expense.id}`);
    } else {
      post('/expenses');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Header con botón volver */}
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" size="icon" asChild>
          <Link href="/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifica los datos del gasto' : 'Registra un nuevo gasto tipo factura'}
          </p>
        </div>
      </div>

      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Gasto *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Ej: Compra de supermercado"
              />
              <InputError message={errors.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_date">Fecha *</Label>
              <Input
                id="expense_date"
                type="date"
                value={data.expense_date}
                onChange={(e) => setData('expense_date', e.target.value)}
              />
              <InputError message={errors.expense_date} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method_id">Método de Pago *</Label>
              <Select
                value={data.payment_method_id}
                onValueChange={(value) => setData('payment_method_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id.toString()}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={errors.payment_method_id} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Descuento</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                value={data.discount}
                onChange={(e) => setData('discount', e.target.value)}
                placeholder="0.00"
                className={discountError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              <InputError message={errors.discount || discountError} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observación</Label>
            <Textarea
              id="observation"
              value={data.observation}
              onChange={(e) => setData('observation', e.target.value)}
              placeholder="Descripción general (opcional)"
              rows={3}
            />
            <InputError message={errors.observation} />
          </div>
        </CardContent>
      </Card>

      {/* Detalles del Gasto */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detalles del Gasto</CardTitle>
            <Button type="button" onClick={addDetail} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Ítem
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.details.map((detail, index) => (
            <Card 
              key={detail.id || index} 
              className={detail._destroy ? 'bg-destructive/10 border-destructive/50' : 'bg-muted/30'}
            >
              <CardContent className="pt-4">
                {detail._destroy ? (
                  // Modo eliminado - Mostrar solo resumen con opción de restaurar
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-4">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive line-through">{detail.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Este ítem será eliminado al guardar
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => restoreDetail(index)}
                    >
                      Restaurar
                    </Button>
                  </div>
                ) : (
                  // Modo normal - Mostrar campos editables
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-12">
                      <div className="md:col-span-4 space-y-1">
                        <Label className="text-xs">Descripción *</Label>
                        <Input
                          value={detail.name}
                          onChange={(e) => updateDetail(index, 'name', e.target.value)}
                          placeholder="Nombre del ítem"
                        />
                        <InputError message={errors[`details.${index}.name` as keyof typeof errors]} />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-xs">Categoría *</Label>
                        <Select
                          value={detail.category_id}
                          onValueChange={(value) => updateDetail(index, 'category_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <InputError message={errors[`details.${index}.category_id` as keyof typeof errors]} />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-xs">Cantidad *</Label>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          value={detail.quantity}
                          onChange={(e) => updateDetail(index, 'quantity', e.target.value)}
                        />
                        <InputError message={errors[`details.${index}.quantity` as keyof typeof errors]} />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-xs">Precio Unit. *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={detail.amount}
                          onChange={(e) => updateDetail(index, 'amount', e.target.value)}
                        />
                        <InputError message={errors[`details.${index}.amount` as keyof typeof errors]} />
                      </div>

                      <div className="md:col-span-1 space-y-1">
                        <Label className="text-xs">Subtotal</Label>
                        <Input
                          value={((parseFloat(detail.amount) || 0) * (parseFloat(detail.quantity) || 0)).toFixed(2)}
                          readOnly
                          className="bg-muted font-medium"
                        />
                      </div>

                      <div className="md:col-span-1 flex items-end">
                        {(data.details.filter(d => !d._destroy).length > 1 || !detail.id) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDetail(index)}
                            className="text-destructive hover:text-destructive"
                            title={detail.id ? 'Marcar para eliminar' : 'Eliminar ítem'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Observación opcional para cada ítem */}
                    <div className="space-y-1">
                      <Label className="text-xs">Observación del ítem</Label>
                      <Input
                        value={detail.observation}
                        onChange={(e) => updateDetail(index, 'observation', e.target.value)}
                        placeholder="Descripción adicional (opcional)"
                        className="text-sm"
                      />
                      <InputError message={errors[`details.${index}.observation` as keyof typeof errors]} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end pt-4 border-t">
            <div className="text-right space-y-1">
              <div className="flex justify-between items-center gap-8 text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({data.details.filter(d => !d._destroy).length} ítems)
                </span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              {parseFloat(data.discount) > 0 && (
                <div className="flex justify-between items-center gap-8 text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="font-medium text-red-600">-${parseFloat(data.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center gap-8 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">${calculateTotal().toFixed(2)}</span>
              </div>
              {data.details.some(d => d._destroy) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {data.details.filter(d => d._destroy).length} ítem(s) marcado(s) para eliminar
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentación */}
      <Card>
        <CardHeader>
          <CardTitle>Documentación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="document_number">Número de Documento</Label>
              <Input
                id="document_number"
                value={data.document_number}
                onChange={(e) => setData('document_number', e.target.value)}
                placeholder="Ej: FAC-001"
              />
              <InputError message={errors.document_number} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Documento (PDF, JPG, PNG)</Label>
              <div className="flex gap-2">
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById('document')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {fileName || (expense?.document_path ? 'Cambiar archivo' : 'Seleccionar archivo')}
                </Button>
              </div>
              {expense?.document_path && !fileName && (
                <p className="text-sm text-muted-foreground">
                  Archivo actual: {expense.document_path.split('/').pop()}
                </p>
              )}
              <InputError message={errors.document} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/expenses">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={processing}>
          {processing ? 'Guardando...' : (isEditing ? 'Actualizar Gasto' : 'Guardar Gasto')}
        </Button>
      </div>
    </form>
  );
}

