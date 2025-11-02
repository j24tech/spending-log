import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFlash } from '@/contexts/FlashContext';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function CreatePaymentMethod() {
    const { showFlash } = useFlash();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        observation: '',
        tags: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/payment-methods', {
            onSuccess: () => {
                showFlash('success', 'Método de pago creado exitosamente');
            },
            onError: () => {
                showFlash('error', 'Error al crear el método de pago');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Nuevo Método de Pago" />

            <div className="px-4 py-6 md:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                asChild
                            >
                                <Link href="/payment-methods">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Nuevo Método de Pago
                                </h1>
                                <p className="text-muted-foreground">
                                    Registra un nuevo método de pago
                                </p>
                            </div>
                        </div>

                        {/* Form Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Información del Método de Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nombre{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Ej: Efectivo, Tarjeta de Crédito, Transferencia"
                                        className={
                                            errors.name
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="observation">
                                        Observación
                                    </Label>
                                    <Textarea
                                        id="observation"
                                        value={data.observation}
                                        onChange={(e) =>
                                            setData(
                                                'observation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Observaciones adicionales (opcional)"
                                        rows={3}
                                        className={
                                            errors.observation
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    <InputError message={errors.observation} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags">Etiquetas</Label>
                                    <Input
                                        id="tags"
                                        value={data.tags}
                                        onChange={(e) =>
                                            setData('tags', e.target.value)
                                        }
                                        placeholder="Ej: chile, jesus, deuda (separadas por comas)"
                                        className={
                                            errors.tags
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Separa las etiquetas con comas
                                    </p>
                                    <InputError message={errors.tags} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/payment-methods">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Guardando...'
                                    : 'Guardar Método de Pago'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
