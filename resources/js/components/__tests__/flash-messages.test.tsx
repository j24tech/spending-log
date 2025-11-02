import * as useToast from '@/hooks/use-toast';
import * as usePage from '@inertiajs/react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlashProvider } from '../../contexts/FlashContext';
import { FlashMessages } from '../flash-messages';

// Mock Inertia's usePage hook
vi.mock('@inertiajs/react', () => ({
    usePage: vi.fn(),
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
    toast: vi.fn(),
}));

describe('FlashMessages', () => {
    const mockToast = vi.fn();

    beforeEach(() => {
        mockToast.mockClear();
        vi.mocked(useToast.toast).mockImplementation(mockToast);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should display success toast when flash.success is provided', () => {
        vi.mocked(usePage.usePage).mockReturnValue({
            props: {
                flash: {
                    success: 'Gasto creado exitosamente',
                },
            },
        } as any);

        render(
            <FlashProvider>
                <FlashMessages />
            </FlashProvider>,
        );

        expect(mockToast).toHaveBeenCalledTimes(1);
        expect(mockToast).toHaveBeenCalledWith({
            title: '¡Éxito!',
            description: 'Gasto creado exitosamente',
            variant: 'success',
            duration: 4000,
        });
    });

    it('should display error toast when flash.error is provided', () => {
        vi.mocked(usePage.usePage).mockReturnValue({
            props: {
                flash: {
                    error: 'Error al crear el gasto',
                },
            },
        } as any);

        render(
            <FlashProvider>
                <FlashMessages />
            </FlashProvider>,
        );

        expect(mockToast).toHaveBeenCalledTimes(1);
        expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: 'Error al crear el gasto',
            variant: 'destructive',
            duration: 5000,
        });
    });

    it('should display info toast when flash.info is provided', () => {
        vi.mocked(usePage.usePage).mockReturnValue({
            props: {
                flash: {
                    info: 'Información importante',
                },
            },
        } as any);

        render(
            <FlashProvider>
                <FlashMessages />
            </FlashProvider>,
        );

        expect(mockToast).toHaveBeenCalledTimes(1);
        expect(mockToast).toHaveBeenCalledWith({
            title: 'Información',
            description: 'Información importante',
            variant: 'default',
            duration: 4000,
        });
    });

    it('should not display any toast when no flash messages are provided', () => {
        vi.mocked(usePage.usePage).mockReturnValue({
            props: {
                flash: {},
            },
        } as any);

        render(
            <FlashProvider>
                <FlashMessages />
            </FlashProvider>,
        );

        expect(mockToast).not.toHaveBeenCalled();
    });

    it('should display multiple toasts when multiple flash messages are provided', () => {
        vi.mocked(usePage.usePage).mockReturnValue({
            props: {
                flash: {
                    success: 'Operación exitosa',
                    error: 'Error en otra operación',
                    info: 'Información adicional',
                },
            },
        } as any);

        render(
            <FlashProvider>
                <FlashMessages />
            </FlashProvider>,
        );

        expect(mockToast).toHaveBeenCalledTimes(3);
    });
});
