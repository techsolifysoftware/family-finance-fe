import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  XCircle,
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
      <DialogContent className="sm:max-w-[850px] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl font-bold">
            Tình trạng đóng góp
          </DialogTitle>
          <DialogDescription className="text-base">
            Sự kiện:{" "}
            <span className="font-semibold text-foreground">{eventName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm thành viên..."
                className="pl-9 h-10 border-border/50"
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
              <SelectTrigger className="w-full sm:w-[180px] h-10 border-border/50">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="PAID">Đã đóng đủ</SelectItem>
                <SelectItem value="UNPAID">Chưa đóng đủ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border border-border/50 rounded-xl flex-1 overflow-auto bg-card shadow-inner">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
                <CheckCircle2 className="w-10 h-10 opacity-20" />
                <p>Không tìm thấy thành viên nào</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow className="border-border/50">
                    <TableHead className="w-[300px]">Thành viên</TableHead>
                    {data[0]?.rounds.map((r) => (
                      <TableHead
                        key={r.roundId}
                        className="text-center font-bold"
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
                      className="hover:bg-muted/30 border-border/50"
                    >
                      <TableCell className="py-4">
                        <div className="font-bold text-sm">{m.memberName}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {m.branchName}
                        </div>
                      </TableCell>
                      {m.rounds.map((r) => (
                        <TableCell key={r.roundId} className="text-center py-4">
                          {r.paid ? (
                            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Đã đóng
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-rose-600 font-bold text-[10px] bg-rose-50 px-3 py-1 rounded-full border border-rose-100 uppercase">
                              <XCircle className="w-3.5 h-3.5" />
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
        </div>

        <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4 px-6 mt-auto">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            Tổng cộng:{" "}
            <span className="font-bold text-foreground">
              {pagination.total}
            </span>{" "}
            thành viên
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border-border/50"
              disabled={pagination.page <= 1 || loading}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-xs font-bold text-muted-foreground px-2 bg-background h-9 flex items-center rounded-lg border border-border/50">
              Trang {pagination.page} / {pagination.lastPage}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border-border/50"
              disabled={pagination.page >= pagination.lastPage || loading}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-8 h-10 font-bold hidden sm:flex"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
