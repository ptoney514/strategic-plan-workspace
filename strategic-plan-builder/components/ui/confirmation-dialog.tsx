'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  requireTyping?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  requireTyping,
  variant = "default",
  onConfirm,
  loading = false,
  children
}: ConfirmationDialogProps) {
  const [typedText, setTypedText] = useState("");
  
  const canConfirm = requireTyping 
    ? typedText === requireTyping 
    : true;

  const handleConfirm = () => {
    if (canConfirm && !loading) {
      onConfirm();
      setTypedText(""); // Reset for next use
    }
  };

  const handleCancel = () => {
    setTypedText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {variant === "destructive" && (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {children && (
          <div className="py-4">
            {children}
          </div>
        )}
        
        {requireTyping && (
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Type <span className="font-mono bg-slate-100 px-1 rounded">{requireTyping}</span> to confirm:
            </Label>
            <Input
              id="confirm-text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={requireTyping}
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && canConfirm) {
                  handleConfirm();
                }
              }}
            />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            variant={variant === "destructive" ? "destructive" : "default"}
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {variant === "destructive" ? "Deleting..." : "Processing..."}
              </>
            ) : (
              <>
                {variant === "destructive" && <Trash2 className="mr-2 h-4 w-4" />}
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}