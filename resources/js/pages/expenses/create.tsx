import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
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

            <div className="px-4 py-6 md:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <ExpenseForm
                        categories={categories}
                        paymentMethods={paymentMethods}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
