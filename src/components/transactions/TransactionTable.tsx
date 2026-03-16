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
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Edit2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import type { Transaction } from "@/types";

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: number) => void;
  canManage: boolean;
}

export function TransactionTable({
  transactions,
  loading,
  onEdit,
  onDelete,
  canManage,
}: TransactionTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted/30">
        <TableRow>
          <TableHead className="w-[120px]">Ngày</TableHead>
          <TableHead>Nội dung</TableHead>
          <TableHead>Người thực hiện</TableHead>
          <TableHead>Chi nhánh</TableHead>
          <TableHead className="text-right">Số tiền</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                Đang tải dữ liệu...
              </div>
            </TableCell>
          </TableRow>
        ) : transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
              Không tìm thấy giao dịch nào.
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((tx) => (
            <TableRow key={tx.id} className="group">
              <TableCell className="text-muted-foreground">
                {format(new Date(tx.date), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{tx.description}</span>
                  {tx.event && (
                    <span className="text-[10px] text-primary bg-primary/10 w-fit px-1.5 py-0.5 rounded mt-1">
                      Sự kiện: {tx.event.name}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {tx.member ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                      {tx.member.name.charAt(0)}
                    </div>
                    <span>{tx.member.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">
                    Cập nhật bởi hệ thống
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal border-border/50">
                  {tx.branch?.name || "N/A"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={cn(
                      "font-bold",
                      tx.type === "EXPENSE" ? "text-rose-600" : "text-emerald-600"
                    )}
                  >
                    {tx.type === "EXPENSE" ? "-" : "+"}
                    {tx.amount.toLocaleString("vi-VN")} ₫
                  </span>
                  {tx.type === "EXPENSE" ? (
                    <ArrowDownCircle className="w-4 h-4 text-rose-600/50" />
                  ) : (
                    <ArrowUpCircle className="w-4 h-4 text-emerald-600/50" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(tx)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        onClick={() => onDelete(tx.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
