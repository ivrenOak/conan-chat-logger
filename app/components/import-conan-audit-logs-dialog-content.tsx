import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { useState } from 'react';
import { Button } from './ui/button';
import { XIcon } from 'lucide-react';
import { DialogClose } from './ui/dialog';

export function ImportConanAuditLogsDialogContent() {
    const [files, setFiles] = useState<string[]>([]);
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Import Conan Audit Logs</DialogTitle>
            </DialogHeader>
            <DialogDescription>
                Select one or more files to import. Only files in the default
                Conan audit log format are supported. <br />
                <br /> Sender name parsing is not always exact. You can adjust
                sender names manually for each message after opening the
                imported session.
            </DialogDescription>
            <Button
                variant="outline"
                onClick={() =>
                    window.api
                        .showOpenDialog({
                            title: 'Select a folder',
                            properties: ['openFile', 'multiSelections'],
                        })
                        .then((result) => {
                            if (result.filePaths.length > 0) {
                                setFiles((prevFiles) =>
                                    Array.from(
                                        new Set([
                                            ...prevFiles,
                                            ...result.filePaths,
                                        ]),
                                    ),
                                );
                            }
                        })
                }
            >
                Select Files
            </Button>
            {files.length > 0 && (
                <div className="space-y-2 mt-2">
                    {files.map((file) => (
                        <div
                            key={file}
                            className="flex items-center justify-between gap-2 rounded-md border px-2 py-1"
                        >
                            <p className="text-sm break-all">{file}</p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Remove ${file}`}
                                onClick={() =>
                                    setFiles((prevFiles) =>
                                        prevFiles.filter(
                                            (nextFile) => nextFile !== file,
                                        ),
                                    )
                                }
                            >
                                <XIcon className="size-3.5 text-muted-foreground" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" onClick={() => setFiles([])}>
                        Cancel
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        variant="default"
                        onClick={() => {
                            window.api.importConanAuditLogs(files);
                        }}
                    >
                        Import
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}
