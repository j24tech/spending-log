import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { type Paginated } from '@/types';
import { DiscountActions } from './discount-actions';

interface Discount {
    id: number;
    name: string;
    observation: string | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    data: Paginated<Discount>;
}

export function DiscountsTable({ data }: Props) {
    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Observación</TableHead>
                                <TableHead>Etiquetas</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        No hay tipos de descuento registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((discount) => (
                                    <TableRow key={discount.id}>
                                        <TableCell className="font-medium">
                                            {discount.name}
                                        </TableCell>
                                        <TableCell>
                                            {discount.observation || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {discount.tags &&
                                            discount.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {discount.tags.map(
                                                        (tag, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DiscountActions
                                                discount={discount}
                                            />
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


