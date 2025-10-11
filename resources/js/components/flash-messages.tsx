import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

interface Flash {
  success?: string;
  error?: string;
  info?: string;
}

export function FlashMessages() {
  const { flash } = usePage().props as { flash: Flash };
  const { toast } = useToast();

  useEffect(() => {
    if (flash.success) {
      toast({
        title: "¡Éxito!",
        description: flash.success,
        variant: "success",
        duration: 4000,
      });
    }

    if (flash.error) {
      toast({
        title: "Error",
        description: flash.error,
        variant: "destructive",
        duration: 5000,
      });
    }

    if (flash.info) {
      toast({
        title: "Información",
        description: flash.info,
        variant: "default",
        duration: 4000,
      });
    }
  }, [flash, toast]);

  return null;
}

