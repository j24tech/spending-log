import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from 'react';

type FlashVariant = 'success' | 'error' | 'info';

interface FlashMessage {
    variant: FlashVariant;
    title: string;
    description: string;
    duration?: number;
}

interface FlashContextType {
    flash: FlashMessage | null;
    setFlash: (
        variant: FlashVariant,
        description: string,
        duration?: number,
    ) => void;
    clearFlash: () => void;
}

const FlashContext = createContext<FlashContextType | undefined>(undefined);

export function FlashProvider({ children }: { children: ReactNode }) {
    const [flash, setFlashState] = useState<FlashMessage | null>(null);

    const setFlash = useCallback(
        (
            variant: FlashVariant,
            description: string,
            duration = variant === 'error' ? 5000 : 4000,
        ) => {
            const titles = {
                success: '¡Éxito!',
                error: 'Error',
                info: 'Información',
            };

            setFlashState({
                variant,
                title: titles[variant],
                description,
                duration,
            });
        },
        [],
    );

    const clearFlash = useCallback(() => {
        setFlashState(null);
    }, []);

    return (
        <FlashContext.Provider value={{ flash, setFlash, clearFlash }}>
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
