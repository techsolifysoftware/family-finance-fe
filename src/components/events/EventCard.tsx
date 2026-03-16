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
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Edit2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  canManage: boolean;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
}

export function EventCard({ event, canManage, onEdit, onDelete }: EventCardProps) {
  const totalExpense =
    event.transactions
      ?.filter((t) => t.type === "EXPENSE")
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const progress = event.budget > 0 ? (totalExpense / event.budget) * 100 : 0;
  const isOverBudget = totalExpense > event.budget;

  return (
    <Card className="group overflow-hidden border-border/50 hover:shadow-md transition-all">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold line-clamp-1">
              {event.name}
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(event.date), "dd/MM/yyyy")}
            </div>
          </div>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(event)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                  onClick={() => onDelete(event.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Tiến độ chi tiêu</span>
            <span
              className={cn(isOverBudget ? "text-destructive" : "text-primary")}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <Progress
            value={Math.min(100, progress)}
            className={cn(isOverBudget && "[&>div]:bg-destructive")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Dự toán
            </p>
            <p className="font-bold text-lg">
              {event.budget.toLocaleString("vi-VN")}{" "}
              <span className="text-xs font-normal">₫</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Thực chi
            </p>
            <p
              className={cn(
                "font-bold text-lg",
                isOverBudget ? "text-destructive" : "text-emerald-600"
              )}
            >
              {totalExpense.toLocaleString("vi-VN")}{" "}
              <span className="text-xs font-normal">₫</span>
            </p>
          </div>
        </div>

        {isOverBudget && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 p-2.5 rounded-lg flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Đã chi vượt dự toán{" "}
              {(((totalExpense - event.budget) / event.budget) * 100).toFixed(0)}
              %
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-6">
        <Button
          variant="ghost"
          className="w-full justify-between group-hover:bg-muted/50 h-9 px-3"
        >
          <span className="text-sm font-medium">Xem các giao dịch</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Button>
      </CardFooter>
    </Card>
  );
}
