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

interface ExpenseDetail {
  id: number;
  name: string;
  amount: string;
  quantity: string;
  observation: string | null;
  category_id: number;
}

interface Expense {
  id: number;
  name: string;
  expense_date: string;
  observation: string | null;
  document_number: string | null;
  document_path: string | null;
  payment_method_id: number;
  expense_details: ExpenseDetail[];
}

interface Props {
  expense: Expense;
  categories: Category[];
  paymentMethods: PaymentMethod[];
}

export default function EditExpense({ expense, categories, paymentMethods }: Props) {
  return (
    <AppLayout>
      <Head title="Editar Gasto" />
      
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <ExpenseForm 
            expense={expense}
            categories={categories}
            paymentMethods={paymentMethods}
          />
        </div>
      </div>
    </AppLayout>
  );
}

