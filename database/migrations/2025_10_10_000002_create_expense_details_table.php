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
        Schema::create('expense_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('expense_id');
            $table->string('name', 150);
            $table->decimal('amount', 10, 2);
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('observation', 255)->nullable();
            $table->foreignId('category_id')
                ->constrained('categories')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->timestamps();
            
            // Indexes
            $table->index('expense_id', 'idx_expense_details_expense_id');
            $table->index('category_id', 'idx_expense_details_category_id');
            $table->index('name', 'idx_expense_details_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_details');
    }
};

