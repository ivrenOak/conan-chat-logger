import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { DialogClose } from "./ui/dialog";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";

type TitleDialogProps = {
    titleValue: string;
    setTitleValue: (value: string) => void | Promise<void>;
};

export function TitleDialog({ titleValue, setTitleValue }: TitleDialogProps) {

    const [newValue, setNewValue] = useState(titleValue);

    useEffect(() => {
        setNewValue(titleValue);
    }, [titleValue]);

    return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
            variant="ghost"
            size="icon-sm"
          >
              <Pencil className="size-4 text-muted-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit Title</DialogTitle>
            </DialogHeader>
            <Input id="title" name="title" value={newValue} onChange={(e) => setNewValue(e.target.value)} aria-invalid={!newValue}/>
            <DialogDescription>{!newValue && "Enter a title for the session."}</DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button disabled={!newValue} onClick={async () => {
                  await setTitleValue(newValue);
                }}>Save changes</Button>
              </DialogClose>
              
              
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
}