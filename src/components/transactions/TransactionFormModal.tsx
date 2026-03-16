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
import type { Branch, Event, Member } from "@/types";

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    type: string;
    amount: string;
    description: string;
    date: string;
    memberId: string;
    branchId: string;
    eventId: string;
  };
  setFormData: (data: {
    type: string;
    amount: string;
    description: string;
    date: string;
    memberId: string;
    branchId: string;
    eventId: string;
  }) => void;
  editingId: number | null;
  members: Member[];
  branches: Branch[];
  events: Event[];
}

export function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingId,
  members,
  branches,
  events,
}: TransactionFormModalProps) {
  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") return "";
    return parseInt(numericValue).toLocaleString("vi-VN");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setFormData({ ...formData, amount: formatted });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Cập nhật giao dịch" : "Thêm giao dịch mới"}
          </DialogTitle>
          <DialogDescription>
            Nhập chi tiết thông tin thu chi bên dưới. Các thay đổi sẽ được lưu
            vào sổ cái.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Loại giao dịch</Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData({ ...formData, type: val })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Khoản Thu (+)</SelectItem>
                  <SelectItem value="EXPENSE">Khoản Chi (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Ngày</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền (₫)</Label>
            <Input
              id="amount"
              placeholder="0"
              className="text-lg font-bold"
              value={formData.amount}
              onChange={handleAmountChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Nội dung</Label>
            <Input
              id="description"
              placeholder="Ví dụ: Đóng góp giỗ tổ, Mua lễ vật..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="member">Người đóng / Người chi</Label>
              <Select
                value={formData.memberId}
                onValueChange={(val) =>
                  setFormData({ ...formData, memberId: val })
                }
              >
                <SelectTrigger id="member">
                  <SelectValue placeholder="Chọn thành viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Không chọn --</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name} ({m.branch?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Thuộc Chi nhánh</Label>
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
                  <SelectItem value="none">-- Không chọn --</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event">Liên kết Sự kiện / Dự toán</Label>
            <Select
              value={formData.eventId}
              onValueChange={(val) =>
                setFormData({ ...formData, eventId: val })
              }
            >
              <SelectTrigger id="event">
                <SelectValue placeholder="Chọn sự kiện để theo dõi tiến độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Không liên kết --</SelectItem>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id.toString()}>
                    {ev.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu giao dịch</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
