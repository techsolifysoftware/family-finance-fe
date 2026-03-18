import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Edit2,
  MoreVertical,
  Trash2,
  Target,
  TrendingUp,
  Receipt,
} from "lucide-react";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  canManage: boolean;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
  onViewStatus: (event: Event) => void;
  onViewTransactions: (event: Event) => void;
}

export function EventCard({
  event,
  canManage,
  onEdit,
  onDelete,
  onViewStatus,
  onViewTransactions,
}: EventCardProps) {
  const totalExpense =
    event.transactions
      ?.filter((t) => t.type === "EXPENSE")
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const progress = event.budget > 0 ? (totalExpense / event.budget) * 100 : 0;
  const isOverBudget = totalExpense > event.budget;

  return (
    <Card className="group relative overflow-hidden border border-border/5 bg-card hover:bg-card/90 transition-all duration-500 rounded-[2.5rem] shadow-xl shadow-foreground/[0.05] hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 h-full flex flex-col ring-1 ring-border/5">
      {/* Top Status Indicator - Vibrancy */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 z-10",
          isOverBudget ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]" : progress > 80 ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]"
        )}
      />

      <CardHeader className="pb-4 pt-8 px-6 sm:px-8">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className={cn(
                "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors",
                isOverBudget ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-primary/10 text-primary border-primary/20"
              )}>
                {isOverBudget ? "Vượt dự toán" : "Trong tầm soát"}
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground line-clamp-1 break-words">
              {event.name}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 text-[10px] font-bold text-muted-foreground border border-border/10 whitespace-nowrap shadow-sm">
                <Calendar className="w-3 h-3 opacity-60 text-primary" />
                {format(new Date(event.date), "dd/MM/yyyy", { locale: vi })}
              </div>
            </div>
          </div>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 -mr-1 sm:-mr-2 rounded-xl hover:bg-muted/80 transition-colors shrink-0">
                  <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-border/40 shadow-2xl w-48 p-2">
                <DropdownMenuItem onClick={() => onEdit(event)} className="rounded-xl py-2.5 cursor-pointer">
                  <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl py-2.5 text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                  onClick={() => onDelete(event.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa sự kiện
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 sm:space-y-8 px-5 sm:px-6 flex-1">
        {/* Advanced Progress Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-end gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse shrink-0",
                isOverBudget ? "bg-rose-500" : "bg-emerald-500"
              )} />
              <span className="text-[12px] font-bold text-muted-foreground">Tiến độ chi tiêu</span>
            </div>
            <span
              className={cn(
                "text-base sm:text-lg font-black tracking-tighter whitespace-nowrap tabular-nums",
                isOverBudget ? "text-rose-600" : "text-primary"
              )}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <div className="relative">
            <Progress
              value={Math.min(100, progress)}
              className={cn(
                "h-2.5 sm:h-3 rounded-full bg-muted/30 border border-border/20 shadow-inner overflow-hidden",
                isOverBudget && "[&>div]:bg-rose-500",
                !isOverBudget && progress > 80 && "[&>div]:bg-amber-500"
              )}
            />
          </div>
        </div>

        {/* Data Grid with Icons - Made responsive (stacks on small widths) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative p-4 rounded-3xl bg-muted/10 border border-border/5 overflow-hidden group/item hover:bg-muted/15 transition-all duration-300">
            <Target className="absolute -right-2 -bottom-2 w-10 h-10 text-primary/5 transition-transform group-hover/item:scale-110 duration-500" />
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">
              Dự toán
            </p>
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="font-black text-xl tracking-tighter tabular-nums truncate">
                {event.budget.toLocaleString("vi-VN")}
              </span>
              <span className="text-[10px] font-black opacity-30">đ</span>
            </div>
          </div>
          
          <div className={cn(
            "relative p-4 rounded-3xl border border-transparent overflow-hidden group/item transition-all duration-300",
            isOverBudget 
              ? "bg-rose-500/[0.03] border-rose-500/10" 
              : "bg-emerald-500/[0.03] border-emerald-500/10"
          )}>
            <TrendingUp className={cn(
              "absolute -right-2 -bottom-2 w-10 h-10 transition-transform group-hover/item:scale-110 duration-500",
              isOverBudget ? "text-rose-500/10" : "text-emerald-500/10"
            )} />
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">
              Thực chi
            </p>
            <div className="flex items-baseline gap-1 min-w-0">
              <span className={cn(
                "font-black text-xl tracking-tighter tabular-nums truncate",
                isOverBudget ? "text-rose-600" : "text-emerald-600"
              )}>
                {totalExpense.toLocaleString("vi-VN")}
              </span>
              <span className="text-[10px] font-black opacity-30">đ</span>
            </div>
          </div>
        </div>

        {isOverBudget && (
          <div className="bg-rose-500/10 text-rose-600 border border-rose-500/20 px-4 py-3 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 shadow-sm shadow-rose-500/10">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold tracking-tight leading-snug">
              Đã vượt mức dự toán cho phép khoảng{" "}
              {(((totalExpense - event.budget) / event.budget) * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-8 px-6 sm:px-8 flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full justify-between h-12 px-5 border-border/20 bg-background/40 rounded-2xl group/btn hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 shadow-sm"
          onClick={() => onViewStatus(event)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/btn:scale-110 transition-all duration-300 shadow-inner shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground/80 group-hover:text-primary transition-colors truncate">Tình trạng đóng góp</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-between h-12 px-5 hover:bg-muted/30 rounded-2xl group/tx transition-all duration-300"
          onClick={() => onViewTransactions(event)}
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover/tx:bg-white/80 group-hover/tx:text-foreground transition-all shadow-inner shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground/80 group-hover/tx:text-foreground transition-colors truncate">Xem chi tiết giao dịch</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-10 group-hover:opacity-40 group-hover:translate-x-1 transition-all shrink-0" />
        </Button>
      </CardFooter>
    </Card>
  );
}
