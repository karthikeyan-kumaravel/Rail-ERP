<?php

namespace App\Console\Commands;

use App\Services\AlertGenerationService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('alerts:generate')]
#[Description('Regenerate system alerts (e.g. LOA completion reminders) based on current dates.')]
class GenerateAlerts extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(AlertGenerationService $alertGenerationService): int
    {
        $alertGenerationService->syncLoaCompletionAlerts();

        $this->info('Alerts synced.');

        return self::SUCCESS;
    }
}
