import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    description: string;
  };
  setFormData: (data: { name: string; description: string }) => void;
  editingId: number | null;
}

export function BranchFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingId,
}: BranchFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Sửa Chi Nhánh" : "Thêm Chi Nhánh Mới"}
          </DialogTitle>
          <DialogDescription>
            Tên chi nhánh sẽ được dùng để phân loại thành viên và các khoản
            chi tiêu chuyên biệt.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="branch-name">Tên chi nhánh (*)</Label>
            <Input
              id="branch-name"
              placeholder="Ví dụ: Chi Trưởng, Chi Thứ 2..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="font-semibold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-desc">Mô tả / Diễn giải</Label>
            <Input
              id="branch-desc"
              placeholder="Thông tin thêm về chi này..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu lại</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
