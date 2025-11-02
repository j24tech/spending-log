import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { PaymentMethodsTable } from './components/payment-methods-table';

interface PaymentMethod {
    id: number;
    name: string;
    observation: string | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    paymentMethods: Paginated<PaymentMethod>;
}

export default function PaymentMethodsIndex({ paymentMethods }: Props) {
    return (
        <AppLayout>
            <Head title="Métodos de Pago" />

            <div className="space-y-6 px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <Heading title="Métodos de Pago" />
                    <Button asChild>
                        <Link href="/payment-methods/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Método de Pago
                        </Link>
                    </Button>
                </div>

                <PaymentMethodsTable data={paymentMethods} />
            </div>
        </AppLayout>
    );
}
