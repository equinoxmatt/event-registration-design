<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        Event::create(['name' => 'All-hands Meeting', 'date' => '2026-06-15']);
        Event::create(['name' => 'Team Lunch', 'date' => '2026-07-01']);
    }
}
