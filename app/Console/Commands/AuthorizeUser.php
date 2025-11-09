<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class AuthorizeUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:authorize {email} {--revoke : Revocar autorización en lugar de otorgarla}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Autorizar o revocar acceso a un usuario por su correo electrónico';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');
        $revoke = $this->option('revoke');

        // Buscar usuario existente
        $user = User::where('email', $email)->first();

        if ($user) {
            // Usuario existe - actualizar autorización
            $newStatus = ! $revoke;
            $user->update(['authorized' => $newStatus]);

            if ($newStatus) {
                $this->info("✓ Usuario {$email} autorizado exitosamente.");
            } else {
                $this->warn("✓ Autorización revocada para {$email}.");
            }
        } else {
            // Usuario no existe - crear nuevo usuario pre-autorizado
            if ($revoke) {
                $this->error("✗ No se puede revocar acceso. El usuario {$email} no existe.");

                return Command::FAILURE;
            }

            $name = $this->ask('Nombre del usuario', $email);

            User::create([
                'email' => $email,
                'name' => $name,
                'authorized' => true,
                'password' => null, // Sin contraseña - solo Google OAuth
            ]);

            $this->info("✓ Usuario {$email} creado y autorizado exitosamente.");
            $this->line('  El usuario podrá hacer login con Google.');
        }

        return Command::SUCCESS;
    }
}
