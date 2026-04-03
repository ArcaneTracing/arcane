import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
"@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthProfile } from "@/store/authStore";
import { updateProfile } from "@/lib/profile";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import { FormErrorDisplay } from "@/components/shared/form-error-display";

export interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function ProfileModal({ open, onOpenChange }: Readonly<ProfileModalProps>) {
  const profile = useAuthProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{ name: string }>({ name: '' });
  const prevOpenRef = useRef(false);
  const actionError = useActionError({ showToast: true, showInline: true });
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (open && profile && !wasOpen) {
      setFormData({ name: profile?.name || '' });
      actionError.clear();
    }
  }, [open, profile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      actionError.handleError(new Error('Name is required'));
      return;
    }

    setIsLoading(true);
    actionError.clear();

    try {
      const result = await updateProfile({ name: formData.name.trim(), email: profile!.email });
      if (result.success) {
        setIsLoading(false);
        showSuccessToast('Profile updated successfully');
        onOpenChange(false);
      } else {
        actionError.handleError(new Error(result.error || 'Failed to update profile'));
        setIsLoading(false);
      }
    } catch (err) {
      actionError.handleError(err);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}>

        <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}>

          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
              disabled={isLoading} />

            </div>
            <FormErrorDisplay error={actionError.message} variant="inline" />
            <div className="flex justify-end gap-2">
              <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}>

                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
    </Dialog>);

}