import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ReceiptText,
  Search,
  User as UserIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../api";
import { Input } from "../ui/input";

interface RoundStatus {
  roundId: number;
  roundName: string;
  paid: boolean;
}

interface MemberPaymentStatus {
  memberId: number;
  memberName: string;
  branchName: string;
  rounds: RoundStatus[];
}

interface EventPaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventName: string;
}

export function EventPaymentStatusModal({
  isOpen,
  onClose,
  eventId,
  eventName,
}: EventPaymentStatusModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MemberPaymentStatus[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID">(
    "ALL",
  );
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    lastPage: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/events/${eventId}/payment-status`, {
        params: {
          page: pagination.page,
          limit: 10,
          search: debouncedSearch,
          status: statusFilter,
        },
      });
      setData(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.meta.total,
        lastPage: response.data.meta.lastPage,
      }));
    } catch (error) {
      console.error("Error fetching payment status:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId, pagination.page, debouncedSearch, statusFilter]);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchStatus();
    }
  }, [isOpen, eventId, fetchStatus]);

  // Reset page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
        {/* Modern Header */}
        <div className="relative p-8 pb-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm ring-1 ring-primary/20">
                <ReceiptText className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1">
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                  Tình trạng đóng góp
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Sự kiện:</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-tight h-6">
                    {eventName}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 space-y-6 flex-1 flex flex-col min-h-0">
          {/* Refined Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              </div>
              <Input
                placeholder="Tìm tên thành viên hoặc chi nhánh..."
                className="pl-10 h-11 bg-muted/30 border-border/40 focus:bg-background transition-all rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val: "ALL" | "PAID" | "UNPAID") =>
                setStatusFilter(val)
              }
            >
              <SelectTrigger className="w-full sm:w-[200px] h-11 bg-muted/30 border-border/40 focus:bg-background rounded-xl">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 shadow-xl">
                <SelectItem value="ALL" className="py-2.5">Toàn bộ</SelectItem>
                <SelectItem value="PAID" className="py-2.5">Đã đóng đủ</SelectItem>
                <SelectItem value="UNPAID" className="py-2.5">Chưa hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-hidden flex flex-col rounded-[1.5rem] border border-border/40 bg-card shadow-sm">
            <div className="flex-1 overflow-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground animate-pulse">Đang truy xuất dữ liệu...</p>
                </div>
              ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                    <Search className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Không tìm thấy kết quả</h3>
                  <p className="text-sm text-muted-foreground max-w-[280px]">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-md border-b">
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="w-[300px] font-black text-foreground uppercase text-[11px] tracking-widest px-6 h-12">Thành viên</TableHead>
                      {data[0]?.rounds.map((r) => (
                        <TableHead
                          key={r.roundId}
                          className="text-center font-black text-foreground uppercase text-[11px] tracking-widest h-12"
                        >
                          {r.roundName}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((m) => (
                      <TableRow
                        key={m.memberId}
                        className="group hover:bg-primary/[0.02] border-border/30 transition-colors"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground shadow-inner border border-border/20 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <UserIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground text-[15px] truncate leading-none mb-1.5">{m.memberName}</span>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-black uppercase tracking-tighter bg-muted/50 px-1.5 py-0.5 rounded w-fit">
                                {m.branchName}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        {m.rounds.map((r) => (
                          <TableCell key={r.roundId} className="text-center py-4">
                            {r.paid ? (
                              <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-tight shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Đã đóng
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 text-rose-600 font-bold text-[10px] bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 uppercase tracking-tight shadow-sm">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                Chưa đóng
                              </div>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            
            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t bg-muted/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-[13px] text-muted-foreground font-medium">
                Tìm thấy <span className="font-black text-foreground">{pagination.total}</span> thành viên
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 border border-border/40 rounded-xl bg-background shadow-sm hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1 bg-background border border-border/40 rounded-xl px-4 h-9 shadow-sm">
                  <span className="text-xs font-black text-foreground">{pagination.page}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mx-1">/</span>
                  <span className="text-xs font-bold text-muted-foreground">{pagination.lastPage}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 border border-border/40 rounded-xl bg-background shadow-sm hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
                  disabled={pagination.page >= pagination.lastPage || loading}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Overlay */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-md px-8 py-5 border-t flex justify-end">
          <Button
            onClick={onClose}
            className="rounded-2xl px-10 h-12 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground"
          >
            Hoàn tất
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
