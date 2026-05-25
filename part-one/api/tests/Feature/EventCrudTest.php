<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_empty_data_array_when_no_events_exist(): void
    {
        $this->getJson('/api/events')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    public function test_index_returns_all_events_with_correct_shape(): void
    {
        Event::factory()->create(['name' => 'Test Event', 'date' => '2026-06-15', 'registrations' => 3]);

        $this->getJson('/api/events')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'date', 'registrations', 'created_at', 'updated_at']]]);
    }

    public function test_index_orders_events_by_date_ascending(): void
    {
        $later = Event::factory()->create(['date' => '2026-12-01']);
        $earlier = Event::factory()->create(['date' => '2026-06-01']);

        $this->getJson('/api/events')
            ->assertOk()
            ->assertJsonPath('data.0.id', $earlier->id)
            ->assertJsonPath('data.1.id', $later->id);
    }

    public function test_store_creates_an_event_and_returns_201(): void
    {
        $this->postJson('/api/events', ['name' => 'All-hands Meeting', 'date' => '2026-06-15'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'All-hands Meeting')
            ->assertJsonPath('data.date', '2026-06-15')
            ->assertJsonPath('data.registrations', 0);

        $this->assertDatabaseHas('events', ['name' => 'All-hands Meeting', 'date' => '2026-06-15']);
    }

    public function test_store_rejects_missing_fields(): void
    {
        $this->postJson('/api/events', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'date']);
    }

    public function test_store_rejects_name_exceeding_max_length(): void
    {
        $this->postJson('/api/events', ['name' => str_repeat('a', 256), 'date' => '2026-06-15'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_store_rejects_invalid_date_format(): void
    {
        $this->postJson('/api/events', ['name' => 'Test', 'date' => 'not-a-date'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['date']);
    }

    public function test_show_returns_a_single_event(): void
    {
        $event = Event::factory()->create();

        $this->getJson("/api/events/{$event->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $event->id)
            ->assertJsonPath('data.name', $event->name);
    }

    public function test_show_returns_404_for_missing_event(): void
    {
        $this->getJson('/api/events/999')->assertNotFound();
    }

    public function test_update_replaces_event_fields(): void
    {
        $event = Event::factory()->create();

        $this->putJson("/api/events/{$event->id}", ['name' => 'Updated Name', 'date' => '2026-09-01'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.date', '2026-09-01');

        $this->assertDatabaseHas('events', ['id' => $event->id, 'name' => 'Updated Name']);
    }

    public function test_update_rejects_missing_fields(): void
    {
        $event = Event::factory()->create();

        $this->putJson("/api/events/{$event->id}", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'date']);
    }

    public function test_update_returns_404_for_missing_event(): void
    {
        $this->putJson('/api/events/999', ['name' => 'X', 'date' => '2026-06-01'])
            ->assertNotFound();
    }

    public function test_destroy_deletes_the_event_and_returns_204(): void
    {
        $event = Event::factory()->create();

        $this->deleteJson("/api/events/{$event->id}")->assertNoContent();

        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }

    public function test_destroy_returns_404_for_missing_event(): void
    {
        $this->deleteJson('/api/events/999')->assertNotFound();
    }
}
