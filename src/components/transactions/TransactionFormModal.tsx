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
import type { Event, Member, PaymentRound } from "@/types";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/api";
import { useEffect, useState } from "react";

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
  members: initialMembers,
  events: initialEvents,
}: TransactionFormModalProps) {
  const [localMembers, setLocalMembers] = useState<Member[]>(initialMembers);
  const [localEvents, setLocalEvents] = useState<Event[]>(initialEvents);
  const [memberSearch, setMemberSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  const debouncedEventSearch = useDebounce(eventSearch, 500);

  // Synchronize local state with props when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setLocalMembers(initialMembers);
      setLocalEvents(initialEvents);
    }
  }, [isOpen, initialMembers, initialEvents]);

  // Handle member searching
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const res = await api.get("/members", {
          params: { search: debouncedMemberSearch, page: 1, limit: 100 },
        });
        setLocalMembers(res.data.data);
      } catch (err) {
        console.error("Error searching members:", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [debouncedMemberSearch, isOpen]);

  // Handle event searching
  useEffect(() => {
    if (!isOpen) return;

    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const res = await api.get("/events", {
          params: { search: debouncedEventSearch, page: 1, limit: 100 },
        });
        setLocalEvents(res.data.data);
      } catch (err) {
        console.error("Error searching events:", err);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [debouncedEventSearch, isOpen]);

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") return "";
    return parseInt(numericValue).toLocaleString("vi-VN");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setFormData({ ...formData, amount: formatted });
  };

  const selectedEvent = (localEvents || []).find(
    (e: Event) => e.id.toString() === formData.eventId,
  );
  const showRounds =
    formData.type === "INCOME" &&
    selectedEvent &&
    selectedEvent.rounds &&
    selectedEvent.rounds.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
        <DialogHeader className="pt-8 px-8 pb-2">
          <DialogTitle className="text-2xl font-black tracking-tight">
            {editingId ? "Cập nhật giao dịch" : "Thêm giao dịch mới"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground/70">
            Nhập chi tiết thông tin thu chi bên dưới. Các thay đổi sẽ được lưu
            vào sổ cái.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 px-8 pb-10">
          {/* ... types and date grid remains same ... */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-bold text-muted-foreground">Loại giao dịch</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger id="type" className="h-12 rounded-2xl bg-muted/20 border-border/40 hover:bg-muted/30 transition-all font-medium">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-border/40">
                  <SelectItem value="INCOME" className="rounded-xl">Khoản Thu (+)</SelectItem>
                  <SelectItem value="EXPENSE" className="rounded-xl">Khoản Chi (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-bold text-muted-foreground">Ngày</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-medium h-12 rounded-2xl bg-muted/20 border-border/40 hover:bg-muted/30 transition-all px-4",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground/60" />
                    {formData.date ? (
                      format(parseISO(formData.date), "dd 'tháng' MM, yyyy", { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={vi}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-bold text-muted-foreground">Số tiền (₫)</Label>
              <Input
                id="amount"
                placeholder="0"
                className="text-2xl font-black h-14 rounded-2xl bg-muted/20 border-border/40 focus:bg-background transition-all"
                value={formData.amount}
                onChange={handleAmountChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold text-muted-foreground">Nội dung</Label>
              <Input
                id="description"
                placeholder="Ví dụ: Đóng góp giỗ tổ..."
                className="h-14 rounded-2xl bg-muted/20 border-border/40 focus:bg-background transition-all font-medium"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="member" className="text-sm font-bold text-muted-foreground">
              {formData.type === "INCOME" ? "Người đóng" : "Người chi"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              value={formData.memberId}
              onChange={(val) => setFormData({ ...formData, memberId: val.toString() })}
              onSearch={setMemberSearch}
              options={(localMembers || []).map((m) => ({
                value: m.id.toString(),
                label: `${m.name} (${m.branch?.name || "Tự do"})`,
                description: m.description,
              }))}
              placeholder="Chọn thành viên..."
              searchPlaceholder="Tìm tên thành viên..."
              loading={loadingMembers}
            />
          </div>

          <div
            className={cn(
              "grid gap-4",
              showRounds ? "sm:grid-cols-2" : "grid-cols-1",
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="event" className="text-sm font-bold text-muted-foreground">
                Liên kết Sự kiện / Dự toán <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                value={formData.eventId}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    eventId: val.toString(),
                    paymentRoundId: "none",
                  })
                }
                onSearch={setEventSearch}
                options={(localEvents || []).map((ev) => ({
                  value: ev.id.toString(),
                  label: ev.name,
                  description: format(parseISO(ev.date), "dd/MM/yyyy"),
                }))}
                placeholder="Chọn sự kiện..."
                searchPlaceholder="Tìm tên sự kiện..."
                loading={loadingEvents}
              />
            </div>

            {showRounds && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="paymentRound" className="text-sm font-bold text-muted-foreground">
                  Đợt đóng (Round) <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.paymentRoundId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, paymentRoundId: val })
                  }
                >
                  <SelectTrigger id="paymentRound" className="w-full h-12 rounded-2xl bg-muted/20 border-border/40 hover:bg-muted/30 transition-all font-medium">
                    <SelectValue placeholder="Chọn đợt" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl border-border/40">
                    {selectedEvent.rounds?.map((round: PaymentRound) => (
                      <SelectItem key={round.id} value={round.id.toString()} className="rounded-xl">
                        {round.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="pt-6 px-8 pb-8 gap-3 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-12 px-6 font-bold hover:bg-muted/50 border-border/40 transition-all">
              Hủy
            </Button>
            <Button type="submit" className="rounded-xl h-12 px-8 font-black tracking-tight shadow-lg shadow-primary/20 transition-all active:scale-95">
              Lưu giao dịch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
