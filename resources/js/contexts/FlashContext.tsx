import { toast } from '@/hooks/use-toast';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
} from 'react';

interface FlashContextType {
    showFlash: (type: 'success' | 'error' | 'info', message: string) => void;
    clearFlash: () => void;
}

const FlashContext = createContext<FlashContextType | undefined>(undefined);

export function FlashProvider({ children }: { children: ReactNode }) {
    const showFlash = useCallback(
        (type: 'success' | 'error' | 'info', message: string) => {
            console.log('[FlashContext] showFlash called', { type, message });

            // Mostrar el toast inmediatamente
            const toastConfig = {
                success: {
                    title: '¡Éxito!',
                    variant: 'success' as const,
                    duration: 4000,
                },
                error: {
                    title: 'Error',
                    variant: 'destructive' as const,
                    duration: 5000,
                },
                info: {
                    title: 'Información',
                    variant: 'default' as const,
                    duration: 4000,
                },
            };

            const config = toastConfig[type];
            toast({
                title: config.title,
                description: message,
                variant: config.variant,
                duration: config.duration,
            });
        },
        [],
    );

    const clearFlash = useCallback(() => {
        console.log('[FlashContext] clearFlash called');
    }, []);

    return (
        <FlashContext.Provider value={{ showFlash, clearFlash }}>
            {children}
        </FlashContext.Provider>
    );
}

export function useFlash() {
    const context = useContext(FlashContext);
    if (context === undefined) {
        throw new Error('useFlash must be used within a FlashProvider');
    }
    return context;
}
