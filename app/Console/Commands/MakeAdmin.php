<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:admin {email?} {--name=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crear el usuario administrador de la aplicación';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email') ?? $this->ask('Email del administrador');

        if (! $email) {
            $this->error('El email es requerido.');

            return Command::FAILURE;
        }

        // Validar formato de email
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('El email proporcionado no es válido.');

            return Command::FAILURE;
        }

        // Verificar si el usuario ya existe
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            if ($existingUser->is_admin) {
                $this->warn("⚠ El usuario {$email} ya es administrador.");

                return Command::SUCCESS;
            }

            // Si existe pero no es admin, promoverlo
            if ($this->confirm("El usuario {$email} ya existe. ¿Deseas promoverlo a administrador?", true)) {
                $existingUser->update([
                    'is_admin' => true,
                    'authorized' => true,
                ]);

                $this->info("✓ Usuario {$email} promovido a administrador exitosamente.");

                return Command::SUCCESS;
            }

            $this->line('Operación cancelada.');

            return Command::SUCCESS;
        }

        // Crear nuevo usuario administrador
        $name = $this->option('name') ?? $this->ask('Nombre del administrador', $email);

        $user = User::create([
            'email' => $email,
            'name' => $name,
            'authorized' => true,
            'is_admin' => true,
            'password' => null, // Sin contraseña - solo Google OAuth
        ]);

        $this->newLine();
        $this->info('✓ Usuario administrador creado exitosamente.');
        $this->line("  Email: {$user->email}");
        $this->line("  Nombre: {$user->name}");
        $this->line('  Permisos: Administrador');
        $this->line('  Autenticación: Google OAuth');
        $this->newLine();
        $this->line('💡 El administrador puede ahora:');
        $this->line('   • Iniciar sesión con Google');
        $this->line('   • Autorizar otros usuarios con: php artisan user:authorize {email}');

        return Command::SUCCESS;
    }
}
