import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFlash } from '@/contexts/FlashContext';
import AppLayout from '@/layouts/app-layout';
import { index as usersIndex, store as usersStore } from '@/routes/admin/users';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function CreateUser() {
    const { showFlash } = useFlash();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        authorized: true,
        is_admin: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(usersStore.url(), {
            onSuccess: () => {
                showFlash('success', 'Usuario creado exitosamente');
            },
            onError: () => {
                showFlash('error', 'Error al crear el usuario');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Nuevo Usuario" />

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
                                <Link href={usersIndex.url()}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Nuevo Usuario
                                </h1>
                                <p className="text-muted-foreground">
                                    Crea un nuevo usuario en el sistema
                                </p>
                            </div>
                        </div>

                        {/* Form Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Usuario</CardTitle>
                                <CardDescription>
                                    El usuario podrá iniciar sesión con Google
                                    OAuth
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nombre completo
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                        placeholder="Juan Pérez"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Correo electrónico
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                        placeholder="usuario@ejemplo.com"
                                    />
                                    <InputError message={errors.email} />
                                    <p className="text-sm text-muted-foreground">
                                        Debe ser una cuenta de Google válida
                                    </p>
                                </div>

                                {/* Authorized */}
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="authorized"
                                        checked={data.authorized}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'authorized',
                                                checked as boolean,
                                            )
                                        }
                                    />
                                    <div className="space-y-1 leading-none">
                                        <Label htmlFor="authorized">
                                            Usuario autorizado
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            El usuario podrá iniciar sesión en
                                            la aplicación
                                        </p>
                                    </div>
                                </div>

                                {/* Is Admin */}
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="is_admin"
                                        checked={data.is_admin}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'is_admin',
                                                checked as boolean,
                                            )
                                        }
                                    />
                                    <div className="space-y-1 leading-none">
                                        <Label htmlFor="is_admin">
                                            Administrador
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            El usuario tendrá acceso a la
                                            gestión de usuarios
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                disabled={processing}
                            >
                                <Link href={usersIndex.url()}>
                                    Cancelar
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creando...' : 'Crear Usuario'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
