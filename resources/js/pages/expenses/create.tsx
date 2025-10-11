import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ExpenseForm } from './components/expense-form';

interface Category {
  id: number;
  name: string;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface Props {
  categories: Category[];
  paymentMethods: PaymentMethod[];
}

export default function CreateExpense({ categories, paymentMethods }: Props) {
  return (
    <AppLayout>
      <Head title="Nuevo Gasto" />
      
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <ExpenseForm 
            categories={categories}
            paymentMethods={paymentMethods}
          />
        </div>
      </div>
    </AppLayout>
  );
}

