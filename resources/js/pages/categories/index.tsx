import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { CategoriesTable } from './components/categories-table';

interface Category {
    id: number;
    name: string;
    observation: string | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    categories: Paginated<Category>;
}

export default function CategoriesIndex({ categories }: Props) {
    return (
        <AppLayout>
            <Head title="Categorías" />

            <div className="space-y-6 px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <Heading title="Categorías" />
                    <Button asChild>
                        <Link href="/categories/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Categoría
                        </Link>
                    </Button>
                </div>

                <CategoriesTable data={categories} />
            </div>
        </AppLayout>
    );
}
