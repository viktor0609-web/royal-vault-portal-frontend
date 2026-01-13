import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { OrdersSection as UserOrdersSection } from "@/components/user/OrdersSection";

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName: string | null;
}

export function OrdersModal({ isOpen, onClose, userId, userName }: OrdersModalProps) {
  if (!userId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-6xl max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Orders - {userName || 'User'}
          </DialogTitle>
          <DialogDescription>
            Viewing order history for {userName || 'this user'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <UserOrdersSection
            viewAsUserId={userId}
            viewAsUserName={userName || undefined}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
