import { type Paginated } from '@/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PaymentMethodsTable } from '../payment-methods-table';

// Mock the child components
vi.mock('../payment-method-actions', () => ({
    PaymentMethodActions: () => (
        <div data-testid="payment-method-actions">Actions</div>
    ),
}));

vi.mock('@/components/pagination', () => ({
    Pagination: () => <div data-testid="pagination">Pagination</div>,
}));

describe('PaymentMethodsTable', () => {
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

    it('renders empty state when no payment methods', () => {
        render(<PaymentMethodsTable data={mockPaginatedData} />);

        expect(
            screen.getByText('No hay métodos de pago registrados'),
        ).toBeInTheDocument();
    });

    it('renders payment methods table with data', () => {
        const data: Paginated<any> = {
            ...mockPaginatedData,
            data: [
                {
                    id: 1,
                    name: 'Efectivo',
                    observation: 'Pago en efectivo',
                    tags: null,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
                {
                    id: 2,
                    name: 'Tarjeta de Débito',
                    observation: null,
                    tags: null,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            ],
            meta: {
                ...mockPaginatedData.meta,
                total: 2,
            },
        };

        render(<PaymentMethodsTable data={data} />);

        expect(screen.getByText('Efectivo')).toBeInTheDocument();
        expect(screen.getByText('Pago en efectivo')).toBeInTheDocument();
        expect(screen.getByText('Tarjeta de Débito')).toBeInTheDocument();
        expect(screen.getAllByText('-')).toHaveLength(3); // null observation and tags
    });

    it('renders table headers correctly', () => {
        render(<PaymentMethodsTable data={mockPaginatedData} />);

        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Observación')).toBeInTheDocument();
        expect(screen.getByText('Etiquetas')).toBeInTheDocument();
        expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('renders pagination component', () => {
        render(<PaymentMethodsTable data={mockPaginatedData} />);

        expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('renders actions for each payment method', () => {
        const data: Paginated<any> = {
            ...mockPaginatedData,
            data: [
                {
                    id: 1,
                    name: 'Efectivo',
                    observation: null,
                    tags: null,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            ],
            meta: {
                ...mockPaginatedData.meta,
                total: 1,
            },
        };

        render(<PaymentMethodsTable data={data} />);

        const actions = screen.getAllByTestId('payment-method-actions');
        expect(actions).toHaveLength(1);
    });
});
