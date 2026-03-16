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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Branch } from "@/types";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: { name: string; branchId: string };
  setFormData: (data: { name: string; branchId: string }) => void;
  editingId: number | null;
  branches: Branch[];
}

export function MemberFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingId,
  branches,
}: MemberFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Cập nhật thành viên" : "Thêm thành viên mới"}
          </DialogTitle>
          <DialogDescription>
            Thông tin thành viên sẽ được dùng để ghi nhận các khoản đóng góp
            và chi tiêu.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên (*)</Label>
            <Input
              id="name"
              placeholder="Nhập tên đầy đủ..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">Thuộc chi nhánh / Chi (*)</Label>
            <Select
              value={formData.branchId}
              onValueChange={(val) =>
                setFormData({ ...formData, branchId: val })
              }
            >
              <SelectTrigger id="branch">
                <SelectValue placeholder="Chọn chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
