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
import { Building2, Edit2, MoreHorizontal, Receipt, Trash2, Users } from "lucide-react";
import type { Branch } from "@/types";

interface BranchTableProps {
  branches: Branch[];
  loading: boolean;
  canManage: boolean;
  onEdit: (branch: Branch) => void;
  onDelete: (id: number) => void;
}

export function BranchTable({
  branches,
  loading,
  canManage,
  onEdit,
  onDelete,
}: BranchTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted/30">
        <TableRow>
          <TableHead className="px-6">Tên Chi Nhánh</TableHead>
          <TableHead className="hidden md:table-cell">Mô tả</TableHead>
          <TableHead className="text-center">Thành viên</TableHead>
          <TableHead className="text-center">Giao dịch</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                Đang tải dữ liệu...
              </div>
            </TableCell>
          </TableRow>
        ) : branches.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
              Chưa có chi nhánh nào.
            </TableCell>
          </TableRow>
        ) : (
          branches.map((branch) => (
            <TableRow key={branch.id} className="group">
              <TableCell className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-foreground">
                    {branch.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground italic text-sm">
                {branch.description || "Không có mô tả"}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{branch._count?.members || 0}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1.5 font-medium">
                  <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{branch._count?.transactions || 0}</span>
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
                      <DropdownMenuItem onClick={() => onEdit(branch)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Sửa chi
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        onClick={() => onDelete(branch.id)}
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
