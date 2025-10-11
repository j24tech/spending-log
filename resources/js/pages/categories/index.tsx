import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CategoriesTable } from './components/categories-table';
import { CreateCategoryDialog } from './components/create-category-dialog';

interface Category {
  id: number;
  name: string;
  observation: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <AppLayout>
      <Head title="Categorías" />
      
      <div className="space-y-6 px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Heading title="Categorías" />
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoría
          </Button>
        </div>

        <CategoriesTable data={categories} />

        <CreateCategoryDialog 
          open={isCreateOpen} 
          onOpenChange={setIsCreateOpen} 
        />
      </div>
    </AppLayout>
  );
}

