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
import { PaymentMethodActions } from './payment-method-actions';

interface PaymentMethod {
    id: number;
    name: string;
    observation: string | null;
    tags: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    data: Paginated<PaymentMethod>;
}

export function PaymentMethodsTable({ data }: Props) {
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
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-muted-foreground"
                                    >
                                        No hay métodos de pago registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((paymentMethod) => (
                                    <TableRow key={paymentMethod.id}>
                                        <TableCell className="font-medium">
                                            {paymentMethod.name}
                                        </TableCell>
                                        <TableCell>
                                            {paymentMethod.observation || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {paymentMethod.tags &&
                                            paymentMethod.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {paymentMethod.tags.map(
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
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    paymentMethod.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {paymentMethod.is_active
                                                    ? 'Activo'
                                                    : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <PaymentMethodActions
                                                paymentMethod={paymentMethod}
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
