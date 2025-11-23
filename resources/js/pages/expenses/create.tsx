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

interface Discount {
    id: number;
    name: string;
    observation: string | null;
}

interface Props {
    categories: Category[];
    paymentMethods: PaymentMethod[];
    discounts: Discount[];
}

export default function CreateExpense({
    categories,
    paymentMethods,
    discounts,
}: Props) {
    return (
        <AppLayout>
            <Head title="Nuevo Gasto" />

            <div className="px-4 py-6 md:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <ExpenseForm
                        categories={categories}
                        paymentMethods={paymentMethods}
                        discounts={discounts}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
