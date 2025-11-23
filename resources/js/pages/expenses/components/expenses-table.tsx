import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { type Paginated } from '@/types';
import {
    ChevronDown,
    ExternalLink,
    FileText,
    Percent,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { DeleteDetailDialog } from './delete-detail-dialog';
import { EditDetailDialog } from './edit-detail-dialog';
import { ExpenseActions } from './expense-actions';

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

interface Discount {
    id: number;
    name: string;
    observation: string | null;
}

interface ExpenseDiscount {
    id: number;
    discount_id: number;
    observation: string | null;
    discount_amount: string;
    discount: Discount;
}

interface Expense {
    id: number;
    name: string;
    expense_date: string;
    observation: string | null;
    document_number: string | null;
    document_path: string | null;
    tags: string[] | null;
    expense_details: ExpenseDetail[];
    expense_discounts?: ExpenseDiscount[];
    payment_method: PaymentMethod;
    total: number;
}

interface Props {
    data: Paginated<Expense>;
    categories: Category[];
}

export function ExpensesTable({ data, categories }: Props) {
    const [editingDetail, setEditingDetail] = useState<{
        expenseId: number;
        detail: ExpenseDetail;
    } | null>(null);
    const [deletingDetail, setDeletingDetail] = useState<{
        expenseId: number;
        detailId: number;
        detailName: string;
    } | null>(null);

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
                                <TableHead>Etiquetas</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                                <TableHead>Documento</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-center text-muted-foreground"
                                    >
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
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <ChevronDown className="h-4 w-4" />
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {formatDate(
                                                        expense.expense_date,
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {expense.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {
                                                            expense
                                                                .payment_method
                                                                .name
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {expense.tags &&
                                                    expense.tags.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {expense.tags.map(
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
                                                <TableCell className="text-right font-medium">
                                                    {formatAmount(
                                                        expense.total,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        // Strict check: only show link if document_path is a valid non-empty string
                                                        // When document_path is null/empty, the backend unset() it, so it will be undefined in JS
                                                        // We need to check for: undefined, null, empty string, or whitespace-only strings
                                                        const docPath =
                                                            expense.document_path;

                                                        // Helper function to check if path is valid
                                                        const isValidDocumentPath =
                                                            (
                                                                path:
                                                                    | string
                                                                    | null
                                                                    | undefined,
                                                            ): boolean => {
                                                                // If path is undefined, null, or empty string, it's not valid
                                                                if (
                                                                    path ===
                                                                        null ||
                                                                    path ===
                                                                        undefined ||
                                                                    path === ''
                                                                ) {
                                                                    return false;
                                                                }
                                                                // Must be a string and not just whitespace
                                                                if (
                                                                    typeof path !==
                                                                    'string'
                                                                ) {
                                                                    return false;
                                                                }
                                                                // Must have content after trimming
                                                                return (
                                                                    path.trim() !==
                                                                    ''
                                                                );
                                                            };

                                                        if (
                                                            isValidDocumentPath(
                                                                docPath,
                                                            )
                                                        ) {
                                                            return (
                                                                <a
                                                                    href={getDocumentUrl(
                                                                        docPath as string,
                                                                    )}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center text-sm text-blue-600 hover:underline"
                                                                >
                                                                    Ver
                                                                    <ExternalLink className="ml-1 h-3 w-3" />
                                                                </a>
                                                            );
                                                        }

                                                        // No valid document path - show dash
                                                        return (
                                                            <span className="text-muted-foreground">
                                                                -
                                                            </span>
                                                        );
                                                    })()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <ExpenseActions
                                                        expense={expense}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                            <CollapsibleContent asChild>
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={8}
                                                        className="bg-muted/50 p-4"
                                                    >
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                                <FileText className="h-4 w-4" />
                                                                Detalles del
                                                                Gasto
                                                            </div>
                                                            <div className="grid gap-2">
                                                                {expense.expense_details.map(
                                                                    (
                                                                        detail,
                                                                        idx,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="group flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                                                                        >
                                                                            <div className="flex-1">
                                                                                <span className="font-medium">
                                                                                    {
                                                                                        detail.name
                                                                                    }
                                                                                </span>
                                                                                {detail.observation && (
                                                                                    <span className="ml-2 text-muted-foreground">
                                                                                        (
                                                                                        {
                                                                                            detail.observation
                                                                                        }

                                                                                        )
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-4">
                                                                                <Badge variant="outline">
                                                                                    {
                                                                                        detail
                                                                                            .category
                                                                                            .name
                                                                                    }
                                                                                </Badge>
                                                                                <span className="text-muted-foreground">
                                                                                    {
                                                                                        detail.quantity
                                                                                    }{' '}
                                                                                    ×{' '}
                                                                                    {formatAmount(
                                                                                        detail.amount,
                                                                                    )}
                                                                                </span>
                                                                                <span className="min-w-[80px] text-right font-medium">
                                                                                    {formatAmount(
                                                                                        parseFloat(
                                                                                            detail.amount,
                                                                                        ) *
                                                                                            parseFloat(
                                                                                                detail.quantity,
                                                                                            ),
                                                                                    )}
                                                                                </span>
                                                                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-8 w-8"
                                                                                        onClick={() =>
                                                                                            setEditingDetail(
                                                                                                {
                                                                                                    expenseId:
                                                                                                        expense.id,
                                                                                                    detail,
                                                                                                },
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <Pencil className="h-3 w-3" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                                                        onClick={() =>
                                                                                            setDeletingDetail(
                                                                                                {
                                                                                                    expenseId:
                                                                                                        expense.id,
                                                                                                    detailId:
                                                                                                        detail.id,
                                                                                                    detailName:
                                                                                                        detail.name,
                                                                                                },
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <Trash2 className="h-3 w-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>

                                                            {/* Descuentos Aplicados */}
                                                            {expense.expense_discounts && expense.expense_discounts.length > 0 && (
                                                                <div className="mt-4 border-t pt-4">
                                                                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                                                        <Percent className="h-4 w-4" />
                                                                        Descuentos Aplicados
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        {expense.expense_discounts.map(
                                                                            (discount, idx) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 text-sm dark:bg-red-950/20"
                                                                                >
                                                                                    <div className="flex-1">
                                                                                        <span className="font-medium text-red-900 dark:text-red-100">
                                                                                            {discount.discount.name}
                                                                                        </span>
                                                                                        {discount.observation && (
                                                                                            <span className="ml-2 text-muted-foreground">
                                                                                                ({discount.observation})
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="min-w-[80px] text-right font-medium text-red-600 dark:text-red-400">
                                                                                        -{formatAmount(discount.discount_amount)}
                                                                                    </span>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
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
                        onOpenChange={(open) =>
                            !open && setDeletingDetail(null)
                        }
                    />
                )}
            </Card>
            <Pagination data={data} />
        </div>
    );
}
