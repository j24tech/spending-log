import { type Paginated } from '@/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CategoriesTable } from '../categories-table';

// Mock the child components
vi.mock('../category-actions', () => ({
    CategoryActions: () => <div data-testid="category-actions">Actions</div>,
}));

vi.mock('@/components/pagination', () => ({
    Pagination: () => <div data-testid="pagination">Pagination</div>,
}));

describe('CategoriesTable', () => {
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

    it('renders empty state when no categories', () => {
        render(<CategoriesTable data={mockPaginatedData} />);

        expect(
            screen.getByText('No hay categorías registradas'),
        ).toBeInTheDocument();
    });

    it('renders categories table with data', () => {
        const data: Paginated<any> = {
            ...mockPaginatedData,
            data: [
                {
                    id: 1,
                    name: 'Alimentación',
                    observation: 'Comida y bebidas',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
                {
                    id: 2,
                    name: 'Transporte',
                    observation: null,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            ],
            meta: {
                ...mockPaginatedData.meta,
                total: 2,
            },
        };

        render(<CategoriesTable data={data} />);

        expect(screen.getByText('Alimentación')).toBeInTheDocument();
        expect(screen.getByText('Comida y bebidas')).toBeInTheDocument();
        expect(screen.getByText('Transporte')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument(); // null observation
    });

    it('renders table headers correctly', () => {
        render(<CategoriesTable data={mockPaginatedData} />);

        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Observación')).toBeInTheDocument();
        expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('renders pagination component', () => {
        render(<CategoriesTable data={mockPaginatedData} />);

        expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('renders actions for each category', () => {
        const data: Paginated<any> = {
            ...mockPaginatedData,
            data: [
                {
                    id: 1,
                    name: 'Alimentación',
                    observation: null,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            ],
            meta: {
                ...mockPaginatedData.meta,
                total: 1,
            },
        };

        render(<CategoriesTable data={data} />);

        const actions = screen.getAllByTestId('category-actions');
        expect(actions).toHaveLength(1);
    });
});
