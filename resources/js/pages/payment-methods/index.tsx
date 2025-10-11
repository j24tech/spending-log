import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { PaymentMethodsTable } from './components/payment-methods-table';
import { CreatePaymentMethodDialog } from './components/create-payment-method-dialog';

interface PaymentMethod {
  id: number;
  name: string;
  observation: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  paymentMethods: PaymentMethod[];
}

export default function PaymentMethodsIndex({ paymentMethods }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <AppLayout>
      <Head title="Métodos de Pago" />
      
      <div className="space-y-6 px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Heading title="Métodos de Pago" />
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Método de Pago
          </Button>
        </div>

        <PaymentMethodsTable data={paymentMethods} />

        <CreatePaymentMethodDialog 
          open={isCreateOpen} 
          onOpenChange={setIsCreateOpen} 
        />
      </div>
    </AppLayout>
  );
}

