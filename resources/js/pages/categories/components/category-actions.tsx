import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EditCategoryDialog } from './edit-category-dialog';
import { DeleteCategoryDialog } from './delete-category-dialog';

interface Category {
  id: number;
  name: string;
  observation: string | null;
}

interface Props {
  category: Category;
}

export function CategoryActions({ category }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCategoryDialog
        category={category}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeleteCategoryDialog
        category={category}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}

