import { router } from '@inertiajs/react';
import { useState } from 'react';
import SettingsImportModal from '@/lib/settings-import-modal';
import type { SettingsImportModule } from '@/lib/settings-import-modal';
import ToolbarActionButton from '@/lib/toolbar-action-button';
import { template } from '@/routes/admin/imports';

type SettingsImportActionsProps = {
    module: SettingsImportModule;
    title: string;
};

export default function SettingsImportActions({
    module,
    title,
}: SettingsImportActionsProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <ToolbarActionButton
                color="#f59e0b"
                onClick={() => setIsOpen(true)}
            >
                Import Excel
            </ToolbarActionButton>
            <ToolbarActionButton color="#06b6d4" href={template.url(module)}>
                Download Sample Template
            </ToolbarActionButton>
            <SettingsImportModal
                module={module}
                title={title}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onImported={() => router.reload()}
            />
        </>
    );
}
