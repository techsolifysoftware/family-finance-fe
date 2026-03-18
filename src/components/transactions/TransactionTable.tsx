import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Edit2,
  MoreHorizontal,
  Trash2,
  CalendarDays,
  User,
  MapPin,
} from "lucide-react";
import type { Transaction } from "@/types";

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: number) => void;
  canManage: boolean;
}

interface ActionMenuProps {
  tx: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: number) => void;
}

const ActionMenu = ({ tx, onEdit, onDelete }: ActionMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 p-0 hover:bg-muted focus:ring-1 focus:ring-primary/20 transition-all"
      >
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1.5">
        Thao tác
      </DropdownMenuLabel>
      <DropdownMenuItem onClick={() => onEdit(tx)} className="cursor-pointer">
        <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        onClick={() => {
          if (window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
            onDelete(tx.id);
          }
        }}
      >
        <Trash2 className="w-4 h-4 mr-2" /> Xóa giao dịch
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const LoadingView = () => (
  <div className="h-64 flex flex-col items-center justify-center gap-4 py-12">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="text-muted-foreground font-medium animate-pulse">
      Đang tải dữ liệu giao dịch...
    </p>
  </div>
);

const EmptyView = () => (
  <div className="h-64 flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
      <CalendarDays className="w-8 h-8 text-muted-foreground/30" />
    </div>
    <h3 className="text-lg font-semibold">Không tìm thấy giao dịch</h3>
    <p className="text-muted-foreground max-w-xs">
      Chưa có dữ liệu giao dịch nào khớp với bộ lọc hiện tại.
    </p>
  </div>
);

export function TransactionTable({
  transactions,
  loading,
  onEdit,
  onDelete,
  canManage,
}: TransactionTableProps) {
  if (loading && transactions.length === 0) return <LoadingView />;
  if (transactions.length === 0) return <EmptyView />;

  return (
    <div className="relative">
      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 py-4 font-bold text-foreground">
                Ngày
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground">
                Nội dung
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground">
                Người thực hiện
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground text-right">
                Số tiền
              </TableHead>
              <TableHead className="w-[80px] pr-6 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {format(new Date(tx.date), "dd/MM", { locale: vi })}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-bold tracking-tight mt-0.5">
                      Tháng {format(new Date(tx.date), "MM")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col max-w-[300px]">
                    <span
                      className="font-semibold text-foreground line-clamp-1"
                      title={tx.description}
                    >
                      {tx.description}
                    </span>
                    {tx.event && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4.5 bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-wider px-1.5"
                        >
                          {tx.event.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {tx.member ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shadow-sm">
                        {tx.member.name
                          .split(" ")
                          .pop()
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground leading-tight truncate">
                          {tx.member.name}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <MapPin className="w-2.5 h-2.5 opacity-60" />
                          <span className="truncate">
                            {tx.branch?.name || "Tự do"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-3.5 h-3.5 opacity-50" />
                      <span className="text-xs italic">Hệ thống</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-base font-black tracking-tight",
                          tx.type === "EXPENSE"
                            ? "text-rose-600"
                            : "text-emerald-600",
                        )}
                      >
                        {tx.type === "EXPENSE" ? "-" : "+"}
                        {tx.amount.toLocaleString("vi-VN")}
                        <span className="text-[10px] ml-0.5 opacity-80 underline decoration-from-font">
                          đ
                        </span>
                      </span>
                      {tx.type === "EXPENSE" ? (
                        <ArrowDownCircle className="w-4.5 h-4.5 text-rose-500/20 fill-rose-500/5 transition-colors group-hover:text-rose-500/40" />
                      ) : (
                        <ArrowUpCircle className="w-4.5 h-4.5 text-emerald-500/20 fill-emerald-500/5 transition-colors group-hover:text-emerald-500/40" />
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="pr-6 py-4 text-right">
                  {canManage && <ActionMenu tx={tx} onEdit={onEdit} onDelete={onDelete} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-3 p-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-sm active:scale-[0.98] transition-all hover:shadow-md"
          >
            {/* Transaction Type Indicator Bar */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5",
                tx.type === "EXPENSE" ? "bg-rose-500/80" : "bg-emerald-500/80"
              )}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                {/* Date Square */}
                <div className="w-14 h-14 shrink-0 rounded-xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-base font-black leading-none text-foreground">
                    {format(new Date(tx.date), "dd")}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold mt-1 text-center leading-tight">
                    Tháng {format(new Date(tx.date), "MM")}
                    <br />
                    {format(new Date(tx.date), "yyyy")}
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <h4 className="font-bold text-foreground text-sm line-clamp-2 leading-snug mb-2">
                    {tx.description}
                  </h4>

                  {/* Meta Information Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/50 text-[10px] font-medium text-muted-foreground border border-border/30">
                      <User className="w-3 h-3 opacity-60" />
                      <span className="truncate max-w-[80px]">
                        {tx.member?.name || "Hệ thống"}
                      </span>
                    </div>

                    {tx.event && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0 h-5 font-bold bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
                      >
                        {tx.event.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action and Amount Section */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                {canManage && <ActionMenu tx={tx} onEdit={onEdit} onDelete={onDelete} />}
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    {tx.type === "EXPENSE" ? (
                      <ArrowDownCircle className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-black tracking-tighter",
                        tx.type === "EXPENSE"
                          ? "text-rose-600"
                          : "text-emerald-600"
                      )}
                    >
                      {tx.type === "EXPENSE" ? "-" : "+"}
                      {tx.amount.toLocaleString("vi-VN")}
                      <span className="text-[10px] ml-0.5 underline">đ</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
