import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { ExpensesTable } from './components/expenses-table';

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
    category: Category;
}

interface PaymentMethod {
    id: number;
    name: string;
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
    payment_method: PaymentMethod;
    total: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    expenses: Paginated<Expense>;
    categories: Category[];
}

export default function ExpensesIndex({ expenses, categories }: Props) {
    return (
        <AppLayout>
            <Head title="Gastos" />

            <div className="space-y-6 px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <Heading title="Gastos" />
                    <Button asChild>
                        <Link href="/expenses/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Gasto
                        </Link>
                    </Button>
                </div>

                <ExpensesTable data={expenses} categories={categories} />
            </div>
        </AppLayout>
    );
}
