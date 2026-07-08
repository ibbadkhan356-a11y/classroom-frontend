import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

interface UserProfileDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfileDialog = ({ user, open, onOpenChange }: UserProfileDialogProps) => {
  if (!user) return null;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">User Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Detailed information for this user account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-5 py-6">
          <Avatar className="h-24 w-24 border shadow-sm">
            <AvatarImage src={user.image || undefined} className="object-cover" />
            <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">System Role:</span>
            <Badge 
              variant={user.role === "admin" ? "default" : user.role === "teacher" ? "secondary" : "outline"} 
              className="capitalize py-0.5 px-2.5 font-semibold text-xs tracking-wide"
            >
              {user.role}
            </Badge>
          </div>

          {user.createdAt && (
            <div className="text-xs text-muted-foreground/80 border-t pt-4 w-full text-center">
              Member since: {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
