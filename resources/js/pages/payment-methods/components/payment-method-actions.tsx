import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EditPaymentMethodDialog } from './edit-payment-method-dialog';
import { DeletePaymentMethodDialog } from './delete-payment-method-dialog';

interface PaymentMethod {
  id: number;
  name: string;
  observation: string | null;
}

interface Props {
  paymentMethod: PaymentMethod;
}

export function PaymentMethodActions({ paymentMethod }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditPaymentMethodDialog
        paymentMethod={paymentMethod}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeletePaymentMethodDialog
        paymentMethod={paymentMethod}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}

