import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { DiscountsTable } from './components/discounts-table';

interface Discount {
    id: number;
    name: string;
    observation: string | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    discounts: Paginated<Discount>;
}

export default function DiscountsIndex({ discounts }: Props) {
    return (
        <AppLayout>
            <Head title="Tipos de Descuentos" />

            <div className="space-y-6 px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <Heading title="Tipos de Descuentos" />
                    <Button asChild>
                        <Link href="/discounts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Descuento
                        </Link>
                    </Button>
                </div>

                <DiscountsTable data={discounts} />
            </div>
        </AppLayout>
    );
}


