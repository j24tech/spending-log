import { type Paginated } from '@/types';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpensesTable } from '../expenses-table';

// Mock the child components
vi.mock('../expense-actions', () => ({
    ExpenseActions: () => <div data-testid="expense-actions">Actions</div>,
}));

vi.mock('@/components/pagination', () => ({
    Pagination: () => <div data-testid="pagination">Pagination</div>,
}));

describe('ExpensesTable', () => {
    const mockPaginatedData: Paginated<any> = {
        data: [],
        links: [],
        meta: {
            current_page: 1,
            from: null,
            last_page: 1,
            links: [],
            path: '',
            per_page: 10,
            to: null,
            total: 0,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state when no expenses', () => {
        render(<ExpensesTable data={mockPaginatedData} categories={[]} />);

        expect(
            screen.getByText('No hay gastos registrados'),
        ).toBeInTheDocument();
    });

    it('renders expenses table with data', () => {
        const data: Paginated<any> = {
            ...mockPaginatedData,
            data: [
                {
                    id: 1,
                    name: 'Gasto de Prueba',
                    expense_date: '2024-01-15',
                    observation: null,
                    document_number: null,
                    document_path: undefined,
                    payment_method: {
                        id: 1,
                        name: 'Efectivo',
                    },
                    expense_details: [],
                    total: 200,
                },
            ],
            meta: {
                ...mockPaginatedData.meta,
                total: 1,
            },
        };

        render(<ExpensesTable data={data} categories={[]} />);

        expect(screen.getByText('Gasto de Prueba')).toBeInTheDocument();
        expect(screen.getByText('Efectivo')).toBeInTheDocument();
        // Check for formatted amount (might be formatted differently by Intl.NumberFormat)
        expect(screen.getByText(/200/)).toBeInTheDocument();
    });

    it('renders table headers correctly', () => {
        render(<ExpensesTable data={mockPaginatedData} categories={[]} />);

        expect(screen.getByText('Fecha')).toBeInTheDocument();
        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Método de Pago')).toBeInTheDocument();
        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText('Documento')).toBeInTheDocument();
        expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('renders pagination component', () => {
        render(<ExpensesTable data={mockPaginatedData} categories={[]} />);

        expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('renders actions for each expense', () => {
        const data: Paginated<any> = {
            ...mockPaginatedData,
            data: [
                {
                    id: 1,
                    name: 'Gasto de Prueba',
                    expense_date: '2024-01-15',
                    observation: null,
                    document_number: null,
                    document_path: undefined,
                    payment_method: {
                        id: 1,
                        name: 'Efectivo',
                    },
                    expense_details: [],
                    total: 100,
                },
            ],
            meta: {
                ...mockPaginatedData.meta,
                total: 1,
            },
        };

        render(<ExpensesTable data={data} categories={[]} />);

        const actions = screen.getAllByTestId('expense-actions');
        expect(actions).toHaveLength(1);
    });

    it('renders collapsible rows for expenses with details', () => {
        const data: Paginated<any> = {
            ...mockPaginatedData,
            data: [
                {
                    id: 1,
                    name: 'Gasto con Detalles',
                    expense_date: '2024-01-15',
                    observation: null,
                    document_number: null,
                    document_path: undefined,
                    payment_method: {
                        id: 1,
                        name: 'Efectivo',
                    },
                    expense_details: [
                        {
                            id: 1,
                            name: 'Detalle 1',
                            amount: '100.00',
                            quantity: '2',
                            observation: null,
                            category: {
                                id: 1,
                                name: 'Alimentación',
                            },
                            category_id: 1,
                        },
                    ],
                    total: 200,
                },
            ],
            meta: {
                ...mockPaginatedData.meta,
                total: 1,
            },
        };

        render(<ExpensesTable data={data} categories={[]} />);

        expect(screen.getByText('Gasto con Detalles')).toBeInTheDocument();
    });

    it('does not render document link when document_path is null', () => {
        const data: Paginated<any> = {
            ...mockPaginatedData,
            data: [
                {
                    id: 1,
                    name: 'Gasto sin documento',
                    expense_date: '2024-01-15',
                    observation: null,
                    document_number: null,
                    document_path: null,
                    payment_method: {
                        id: 1,
                        name: 'Efectivo',
                    },
                    expense_details: [],
                    total: 100,
                },
            ],
            meta: {
                ...mockPaginatedData.meta,
                total: 1,
            },
        };

        render(<ExpensesTable data={data} categories={[]} />);

        expect(screen.getByText('Gasto sin documento')).toBeInTheDocument();
    });
});
