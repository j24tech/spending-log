import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Inertia router first, before imports
vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            post: vi.fn(),
            get: vi.fn(),
            visit: vi.fn(),
        },
    };
});

// Mock FlashContext
vi.mock('@/contexts/FlashContext', () => ({
    useFlash: () => ({
        showFlash: vi.fn(),
        clearFlash: vi.fn(),
    }),
    FlashProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
}));

// Now import the component
import { ExpenseForm } from '../expense-form';

describe('ExpenseForm', () => {
    const mockCategories = [
        { id: 1, name: 'Alimentación' },
        { id: 2, name: 'Transporte' },
    ];

    const mockPaymentMethods = [
        { id: 1, name: 'Efectivo' },
        { id: 2, name: 'Tarjeta de Débito' },
    ];

    const mockExpense = {
        id: 1,
        name: 'Gasto Original',
        expense_date: '2024-01-15',
        observation: 'Observación original',
        document_number: null,
        document_path: null,
        payment_method_id: 1,
        discount: '0.00',
        expense_details: [
            {
                id: 1,
                name: 'Detalle Original',
                amount: '100.00',
                quantity: '2',
                observation: null,
                category_id: 1,
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Create Mode', () => {
        it('renders form in create mode', () => {
            render(
                <ExpenseForm
                    categories={mockCategories}
                    paymentMethods={mockPaymentMethods}
                />,
            );

            expect(screen.getByText('Nuevo Gasto')).toBeInTheDocument();
            expect(
                screen.getByText('Registra un nuevo gasto tipo factura'),
            ).toBeInTheDocument();
        });

        it('renders with current date', () => {
            render(
                <ExpenseForm
                    categories={mockCategories}
                    paymentMethods={mockPaymentMethods}
                />,
            );

            const dateInput = screen.getByDisplayValue(/2024|2025/i);
            expect(dateInput).toBeInTheDocument();
        });

        it('renders submit button', () => {
            render(
                <ExpenseForm
                    categories={mockCategories}
                    paymentMethods={mockPaymentMethods}
                />,
            );

            const submitButton = screen.getByRole('button', {
                name: /guardar gasto/i,
            });
            expect(submitButton).toBeInTheDocument();
        });
    });

    describe('Edit Mode', () => {
        it('renders form in edit mode', () => {
            render(
                <ExpenseForm
                    categories={mockCategories}
                    paymentMethods={mockPaymentMethods}
                    expense={mockExpense}
                />,
            );

            expect(screen.getByText('Editar Gasto')).toBeInTheDocument();
            expect(
                screen.getByDisplayValue('Gasto Original'),
            ).toBeInTheDocument();
            expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
        });

        it('renders existing details', () => {
            render(
                <ExpenseForm
                    categories={mockCategories}
                    paymentMethods={mockPaymentMethods}
                    expense={mockExpense}
                />,
            );

            expect(
                screen.getByDisplayValue('Detalle Original'),
            ).toBeInTheDocument();
            expect(screen.getByDisplayValue('100.00')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2')).toBeInTheDocument();
        });

        it('renders update button', () => {
            render(
                <ExpenseForm
                    categories={mockCategories}
                    paymentMethods={mockPaymentMethods}
                    expense={mockExpense}
                />,
            );

            const submitButton = screen.getByRole('button', {
                name: /actualizar gasto/i,
            });
            expect(submitButton).toBeInTheDocument();
        });
    });

    describe('Form Interaction', () => {
        it('fills form data', async () => {
            const user = userEvent.setup();
            render(
                <ExpenseForm
                    categories={mockCategories}
                    paymentMethods={mockPaymentMethods}
                />,
            );

            const nameInput = screen.getByPlaceholderText(
                /compra de supermercado/i,
            );
            await user.type(nameInput, 'Nuevo Gasto Test');

            expect(
                screen.getByDisplayValue('Nuevo Gasto Test'),
            ).toBeInTheDocument();
        });

        it('updates detail fields', async () => {
            const user = userEvent.setup();
            render(
                <ExpenseForm
                    categories={mockCategories}
                    paymentMethods={mockPaymentMethods}
                    expense={mockExpense}
                />,
            );

            const detailNameInput =
                screen.getByDisplayValue('Detalle Original');
            await user.clear(detailNameInput);
            await user.type(detailNameInput, 'Detalle Modificado');

            expect(
                screen.getByDisplayValue('Detalle Modificado'),
            ).toBeInTheDocument();
        });
    });

    describe('File Management', () => {
        it('renders file input', () => {
            render(
                <ExpenseForm
                    categories={mockCategories}
                    paymentMethods={mockPaymentMethods}
                    expense={mockExpense}
                />,
            );

            const fileInput = document.getElementById('document');
            expect(fileInput).toBeInTheDocument();
            expect(fileInput).toHaveAttribute('type', 'file');
        });

        it('uploads file', async () => {
            const user = userEvent.setup();
            render(
                <ExpenseForm
                    categories={mockCategories}
                    paymentMethods={mockPaymentMethods}
                    expense={mockExpense}
                />,
            );

            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const fileInput = document.getElementById(
                'document',
            ) as HTMLInputElement;

            await user.upload(fileInput, file);

            expect(fileInput.files).toHaveLength(1);
        });
    });
});
