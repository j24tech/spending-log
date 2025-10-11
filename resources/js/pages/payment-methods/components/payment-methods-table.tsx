import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentMethodActions } from './payment-method-actions';

interface PaymentMethod {
  id: number;
  name: string;
  observation: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  data: PaymentMethod[];
}

export function PaymentMethodsTable({ data }: Props) {
  return (
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
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No hay métodos de pago registrados
                </TableCell>
              </TableRow>
            ) : (
              data.map((paymentMethod) => (
                <TableRow key={paymentMethod.id}>
                  <TableCell className="font-medium">{paymentMethod.name}</TableCell>
                  <TableCell>{paymentMethod.observation || '-'}</TableCell>
                  <TableCell className="text-right">
                    <PaymentMethodActions paymentMethod={paymentMethod} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

