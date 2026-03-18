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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Event, Member } from "@/types";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

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
    paymentRoundId: string;
  };
  setFormData: (data: {
    type: string;
    amount: string;
    description: string;
    date: string;
    memberId: string;
    branchId: string;
    eventId: string;
    paymentRoundId: string;
  }) => void;
  editingId: number | null;
  members: Member[];
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

  const selectedEvent = events.find(
    (e) => e.id.toString() === formData.eventId,
  );
  const showRounds =
    formData.type === "INCOME" &&
    selectedEvent &&
    selectedEvent.rounds &&
    selectedEvent.rounds.length > 0;

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
          {/* ... types and date grid remains same ... */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Loại giao dịch</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 border-input bg-background",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formData.date ? (
                      format(parseISO(formData.date), "dd/MM/yyyy")
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date ? parseISO(formData.date) : undefined}
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        date: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member">
              {formData.type === "INCOME" ? "Người đóng" : "Người chi"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.memberId}
              onValueChange={(val) =>
                setFormData({ ...formData, memberId: val })
              }
            >
              <SelectTrigger id="member" className="w-full">
                <SelectValue placeholder="Chọn thành viên" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.name} ({m.branch?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className={cn(
              "grid gap-4",
              showRounds ? "sm:grid-cols-2" : "grid-cols-1",
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="event">
                Liên kết Sự kiện / Dự toán <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.eventId}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    eventId: val,
                    paymentRoundId: "none",
                  })
                }
              >
                <SelectTrigger id="event" className="w-full">
                  <SelectValue placeholder="Chọn sự kiện" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id.toString()}>
                      {ev.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showRounds && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="paymentRound">
                  Đợt đóng (Round) <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.paymentRoundId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, paymentRoundId: val })
                  }
                >
                  <SelectTrigger id="paymentRound" className="w-full">
                    <SelectValue placeholder="Chọn đợt" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEvent.rounds?.map((round) => (
                      <SelectItem key={round.id} value={round.id.toString()}>
                        {round.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
