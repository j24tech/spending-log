import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryActions } from './category-actions';
import { Pagination } from '@/components/pagination';
import { type Paginated } from '@/types';

interface Category {
  id: number;
  name: string;
  observation: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  data: Paginated<Category>;
}

export function CategoriesTable({ data }: Props) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Observación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No hay categorías registradas
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.observation || '-'}</TableCell>
                    <TableCell className="text-right">
                      <CategoryActions category={category} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination data={data} />
    </div>
  );
}

