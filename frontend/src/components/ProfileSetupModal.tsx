import { useState, useEffect, useRef } from 'react';
import { useSaveCallerUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [role, setRole] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveProfile = useSaveCallerUserProfile();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  // Determine if modal should be shown
  useEffect(() => {
    const shouldShowModal = !profileLoading && isFetched && userProfile === null;
    setIsOpen(shouldShowModal);
  }, [userProfile, profileLoading, isFetched]);

  // Store previous focus when modal opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  const generateUserId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `USR-${timestamp}-${randomStr}`;
  };

  const resetForm = () => {
    setName('');
    setPhoneNumber('');
    setEmergencyContact('');
    setDateOfBirth('');
    setRole('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!role) {
      toast.error('Please select your role');
      return;
    }

    try {
      const userId = generateUserId();

      await saveProfile.mutateAsync({
        name: name.trim(),
        phoneNumber: phoneNumber.trim() ? [phoneNumber.trim()] : [],
        emergencyContact: emergencyContact.trim() ? [emergencyContact.trim()] : [],
        dateOfBirth: dateOfBirth.trim() ? [dateOfBirth.trim()] : [],
        role,
        userId,
        profilePhoto: [],
      });

      // Show success message
      toast.success('Profile created successfully!', {
        description: 'Welcome to E-Suraksha Campus Safety',
        duration: 3000,
      });

      // Close modal
      setIsOpen(false);

      // Reset form for future use
      resetForm();

      // Restore focus to previous element after a short delay
      setTimeout(() => {
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      }, 100);
    } catch (error: any) {
      console.error('Profile creation error:', error);
      toast.error('Failed to create profile', {
        description: error.message || 'Please try again',
      });
    }
  };

  // Don't render if modal shouldn't be shown
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing via escape or outside click
      if (!open) {
        return;
      }
    }}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby="profile-setup-description"
      >
        <DialogHeader>
          <DialogTitle>Welcome to E-Suraksha</DialogTitle>
          <DialogDescription id="profile-setup-description">
            Please set up your profile to continue. This information helps us assist you better in emergencies.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              aria-required="true"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4" aria-hidden="true" />
              Role *
            </Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger id="role" className="w-full" aria-required="true">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select your role in the campus community
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency">Emergency Contact</Label>
            <Input
              id="emergency"
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending}
            aria-busy={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
