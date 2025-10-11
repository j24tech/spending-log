<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->date('expense_date');
            $table->string('observation', 255)->nullable();
            $table->string('document_number', 50)->nullable();
            $table->string('document_path', 2048)->nullable();
            
            // Foreign keys
            $table->foreignId('payment_method_id')
                ->constrained('payment_methods')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            
            $table->timestamps();
            
            // Indexes
            $table->index('expense_date', 'idx_expenses_date');
            $table->index('payment_method_id', 'idx_expenses_payment_method');
            $table->index('document_number', 'idx_expenses_docnum');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};

