<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'date' => fake()->dateTimeBetween('now', '+1 year')->format('Y-m-d'),
            'registrations' => 0,
        ];
    }

    public function withRegistrations(int $count): static
    {
        return $this->state(['registrations' => $count]);
    }
}
