import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFlash } from '@/contexts/FlashContext';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Category {
    id: number;
    name: string;
    observation: string | null;
    tags: string[] | null;
    is_active: boolean;
}

interface Props {
    category: Category;
}

export default function EditCategory({ category }: Props) {
    const { showFlash } = useFlash();
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        observation: category.observation || '',
        tags: category.tags ? category.tags.join(', ') : '',
        is_active: category.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/categories/${category.id}`, {
            onSuccess: () => {
                showFlash('success', 'Categoría actualizada exitosamente');
            },
            onError: () => {
                showFlash('error', 'Error al actualizar la categoría');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Editar Categoría" />

            <div className="space-y-6 px-4 md:px-6 lg:px-8">
                <Heading
                    title="Editar Categoría"
                    description="Modifica la información de la categoría"
                />

                <div className="mx-auto max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-lg border bg-card p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
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
                                        placeholder="Descripción adicional (opcional)"
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
                                        placeholder="comida, bebida, snacks"
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

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'is_active',
                                                checked as boolean,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="is_active"
                                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Activo
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/categories">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Actualizar Categoría
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
