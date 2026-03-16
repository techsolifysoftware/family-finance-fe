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

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    date: string;
    budget: string;
  };
  setFormData: (data: { name: string; date: string; budget: string }) => void;
  editingId: number | null;
}

export function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingId,
}: EventFormModalProps) {
  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") return "";
    return parseInt(numericValue).toLocaleString("vi-VN");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Cập nhật sự kiện" : "Lập kế hoạch sự kiện"}
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin sự kiện và ngân sách dự kiến để theo dõi tiến độ
            chi tiêu.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên sự kiện / Công việc</Label>
            <Input
              id="name"
              placeholder="VD: Đám giỗ Tổ, Tu sửa từ đường..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày dự kiến</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Ngân sách dự trù (₫)</Label>
              <Input
                id="budget"
                placeholder="0"
                className="font-bold text-primary"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: formatCurrencyInput(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu thông tin</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
