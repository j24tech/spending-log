import { type Paginated } from '@/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategoriesTable } from '../categories-table';

interface Category {
    id: number;
    name: string;
    observation: string | null;
    tags: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Mock the child components
vi.mock('../category-actions', () => ({
    CategoryActions: () => <div data-testid="category-actions">Actions</div>,
}));

vi.mock('@/components/pagination', () => ({
    Pagination: () => <div data-testid="pagination">Pagination</div>,
}));

describe('CategoriesTable', () => {
    const mockPaginatedData: Paginated<Category> = {
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
        const data: Paginated<Category> = {
            ...mockPaginatedData,
            data: [
                {
                    id: 1,
                    name: 'Alimentación',
                    observation: 'Comida y bebidas',
                    tags: null,
                    is_active: true,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
                {
                    id: 2,
                    name: 'Transporte',
                    observation: null,
                    tags: null,
                    is_active: true,
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
        // Observación y etiquetas vacías se muestran como "-"
        expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
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
        const data: Paginated<Category> = {
            ...mockPaginatedData,
            data: [
                {
                    id: 1,
                    name: 'Alimentación',
                    observation: null,
                    tags: null,
                    is_active: true,
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
