<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\Event;
use Illuminate\Support\Carbon;
use JsonSerializable;

readonly class EventData implements JsonSerializable
{
    public function __construct(
        public int $id,
        public string $name,
        public Carbon $date,
        public int $registrations,
        public Carbon $createdAt,
        public Carbon $updatedAt,
    ) {}

    public static function fromModel(Event $model): self
    {
        return new self(
            id: $model->id,
            name: $model->name,
            date: $model->date,
            registrations: $model->registrations,
            createdAt: $model->created_at,
            updatedAt: $model->updated_at,
        );
    }

    /** @return array<string, int|string> */
    public function jsonSerialize(): mixed
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'date' => $this->date->toDateString(),
            'registrations' => $this->registrations,
            'created_at' => $this->createdAt->toIso8601String(),
            'updated_at' => $this->updatedAt->toIso8601String(),
        ];
    }
}
