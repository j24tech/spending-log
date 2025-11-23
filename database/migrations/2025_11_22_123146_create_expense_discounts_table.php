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
        Schema::create('expense_discounts', function (Blueprint $table) {
            $table->id();
            $table->string('observation', 255)->nullable();
            $table->decimal('discount_amount', 10, 2);

            // Foreign keys
            $table->foreignId('discount_id')
                ->constrained('discounts')
                ->onUpdate('cascade')
                ->onDelete('restrict');

            $table->foreignId('expense_id')
                ->constrained('expenses')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->timestamps();

            // Indexes
            $table->index('discount_id', 'idx_expense_discounts_discount');
            $table->index('expense_id', 'idx_expense_discounts_expense');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_discounts');
    }
};


