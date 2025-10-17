import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpenseActions } from './expense-actions';
import { ExternalLink, FileText, Pencil, Trash2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { EditDetailDialog } from './edit-detail-dialog';
import { DeleteDetailDialog } from './delete-detail-dialog';
import { Pagination } from '@/components/pagination';
import { type Paginated } from '@/types';

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
  category_id: number;
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
  expense_details: ExpenseDetail[];
  payment_method: PaymentMethod;
  total: number;
}

interface Props {
  data: Paginated<Expense>;
  categories: Category[];
}

export function ExpensesTable({ data, categories }: Props) {
  const [editingDetail, setEditingDetail] = useState<{ expenseId: number; detail: ExpenseDetail } | null>(null);
  const [deletingDetail, setDeletingDetail] = useState<{ expenseId: number; detailId: number; detailName: string } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number | string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const getDocumentUrl = (path: string) => {
    return `/storage/${path}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay gastos registrados
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((expense) => (
                  <Collapsible key={expense.id} asChild>
                    <>
                      <TableRow>
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(expense.expense_date)}
                        </TableCell>
                        <TableCell className="font-medium">{expense.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{expense.payment_method.name}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatAmount(expense.total)}
                        </TableCell>
                        <TableCell>
                          {expense.document_path ? (
                            <a
                              href={getDocumentUrl(expense.document_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-blue-600 hover:underline"
                            >
                              {expense.document_number || 'Ver'}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <ExpenseActions expense={expense} />
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/50 p-4">
                            <div className="space-y-2">
                              <div className="font-semibold text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Detalles del Gasto
                              </div>
                              <div className="grid gap-2">
                                {expense.expense_details.map((detail, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between py-2 px-3 bg-background rounded-md text-sm group hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <span className="font-medium">{detail.name}</span>
                                      {detail.observation && (
                                        <span className="text-muted-foreground ml-2">
                                          ({detail.observation})
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <Badge variant="outline">{detail.category.name}</Badge>
                                      <span className="text-muted-foreground">
                                        {detail.quantity} × {formatAmount(detail.amount)}
                                      </span>
                                      <span className="font-medium min-w-[80px] text-right">
                                        {formatAmount(parseFloat(detail.amount) * parseFloat(detail.quantity))}
                                      </span>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => setEditingDetail({ expenseId: expense.id, detail })}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive"
                                          onClick={() => setDeletingDetail({ 
                                            expenseId: expense.id, 
                                            detailId: detail.id, 
                                            detailName: detail.name 
                                          })}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Dialogs for editing and deleting details */}
        {editingDetail && (
          <EditDetailDialog
            expenseId={editingDetail.expenseId}
            detail={editingDetail.detail}
            categories={categories}
            open={!!editingDetail}
            onOpenChange={(open) => !open && setEditingDetail(null)}
          />
        )}

        {deletingDetail && (
          <DeleteDetailDialog
            expenseId={deletingDetail.expenseId}
            detailId={deletingDetail.detailId}
            detailName={deletingDetail.detailName}
            open={!!deletingDetail}
            onOpenChange={(open) => !open && setDeletingDetail(null)}
          />
        )}
      </Card>
      <Pagination data={data} />
    </div>
  );
}

