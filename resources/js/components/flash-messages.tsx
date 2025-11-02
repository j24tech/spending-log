import { useFlash } from '@/contexts/FlashContext';
import { toast } from '@/hooks/use-toast';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

interface Flash {
    success?: string;
    error?: string;
    info?: string;
}

export function FlashMessages() {
    const { flash: sessionFlash } = usePage().props as { flash?: Flash };
    const { flash: contextFlash, clearFlash } = useFlash();

    // Handle session flash messages (from Laravel redirects)
    useEffect(() => {
        if (sessionFlash?.success) {
            toast({
                title: '¡Éxito!',
                description: sessionFlash.success,
                variant: 'success',
                duration: 4000,
            });
        }

        if (sessionFlash?.error) {
            toast({
                title: 'Error',
                description: sessionFlash.error,
                variant: 'destructive',
                duration: 5000,
            });
        }

        if (sessionFlash?.info) {
            toast({
                title: 'Información',
                description: sessionFlash.info,
                variant: 'default',
                duration: 4000,
            });
        }
    }, [sessionFlash?.success, sessionFlash?.error, sessionFlash?.info]);

    // Handle context flash messages (from setFlash calls)
    useEffect(() => {
        if (contextFlash) {
            const variant =
                contextFlash.variant === 'error'
                    ? 'destructive'
                    : contextFlash.variant === 'info'
                      ? 'default'
                      : contextFlash.variant;

            toast({
                title: contextFlash.title,
                description: contextFlash.description,
                variant: variant as 'success' | 'default' | 'destructive',
                duration: contextFlash.duration,
            });
            // Clear the flash after showing it
            clearFlash();
        }
    }, [contextFlash, clearFlash]);

    return null;
}
