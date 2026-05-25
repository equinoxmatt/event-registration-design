<?php

declare(strict_types=1);

namespace App\Data;

use Illuminate\Support\Carbon;

readonly class EventInput
{
    public function __construct(
        public string $name,
        public Carbon $date,
    ) {}

    /** @param array<string, mixed> $validated */
    public static function fromValidated(array $validated): self
    {
        return new self(
            name: self::string($validated['name']),
            date: Carbon::parse(self::string($validated['date'])),
        );
    }

    private static function string(mixed $value): string
    {
        if (! is_string($value)) {
            throw new \UnexpectedValueException(sprintf('Expected string, got %s.', gettype($value)));
        }

        return $value;
    }
}
