import { Head } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { index as aboutIndex } from '@/routes/about';
import { Info } from 'lucide-react';

interface VersionInfo {
    product_name: string;
    product_version: string;
    description: string;
    laravel_version: string;
    laravel_framework_version: string;
    php_version: string;
    react_version: string;
    inertia_version: string;
    node_version: string | null;
    environment: string;
    debug_mode: boolean;
    license: string;
}

interface Props {
    versionInfo: VersionInfo;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Acerca de',
        href: aboutIndex().url,
    },
];

export default function About({ versionInfo }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Acerca de Spending Log" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Acerca de Spending Log"
                        description="Información sobre la versión y tecnologías utilizadas"
                    />

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                <CardTitle>Información del Producto</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Nombre
                                    </p>
                                    <p className="text-base font-semibold">
                                        {versionInfo.product_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Versión
                                    </p>
                                    <p className="text-base font-semibold">
                                        {versionInfo.product_version}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Descripción
                                    </p>
                                    <p className="text-base">
                                        {versionInfo.description}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Licencia
                                    </p>
                                    <p className="text-base">{versionInfo.license}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Ambiente
                                    </p>
                                    <Badge
                                        variant={
                                            versionInfo.environment === 'production'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {versionInfo.environment}
                                    </Badge>
                                    {versionInfo.debug_mode && (
                                        <Badge
                                            variant="destructive"
                                            className="ml-2"
                                        >
                                            Debug
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stack Tecnológico</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Backend
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Laravel</span>
                                            <Badge variant="outline">
                                                {versionInfo.laravel_version}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">
                                                Laravel Framework
                                            </span>
                                            <Badge variant="outline">
                                                {versionInfo.laravel_framework_version}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">PHP</span>
                                            <Badge variant="outline">
                                                {versionInfo.php_version}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Frontend
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">React</span>
                                            <Badge variant="outline">
                                                {versionInfo.react_version}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Inertia.js</span>
                                            <Badge variant="outline">
                                                {versionInfo.inertia_version}
                                            </Badge>
                                        </div>
                                        {versionInfo.node_version && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Node.js</span>
                                                <Badge variant="outline">
                                                    {versionInfo.node_version}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

