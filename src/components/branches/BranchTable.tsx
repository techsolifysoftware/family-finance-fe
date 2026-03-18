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
import type { Branch } from "@/types";
import {
  Building2,
  Edit2,
  MoreHorizontal,
  Receipt,
  Trash2,
  Users,
} from "lucide-react";

interface BranchTableProps {
  branches: Branch[];
  loading: boolean;
  canManage: boolean;
  onEdit: (branch: Branch) => void;
  onDelete: (id: number) => void;
}

interface ActionMenuProps {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onDelete: (id: number) => void;
}

const ActionMenu = ({ branch, onEdit, onDelete }: ActionMenuProps) => (
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
        Tùy chọn
      </DropdownMenuLabel>
      <DropdownMenuItem
        onClick={() => onEdit(branch)}
        className="cursor-pointer"
      >
        <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa chi
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        onClick={() => onDelete(branch.id)}
      >
        <Trash2 className="w-4 h-4 mr-2" /> Xóa chi nhánh
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export function BranchTable({
  branches,
  loading,
  canManage,
  onEdit,
  onDelete,
}: BranchTableProps) {
  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">
          Đang tải danh sách chi nhánh...
        </p>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
          <Building2 className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">Chưa có chi nhánh nào</h3>
        <p className="text-muted-foreground max-w-xs">
          Hệ thống hiện chưa ghi nhận cơ cấu chi nhánh dòng họ.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 py-4 font-bold text-foreground">
                Tên Chi Nhánh
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground">
                Mô tả
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground text-center">
                Nhân sự
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground text-center">
                Dữ liệu
              </TableHead>
              <TableHead className="w-[80px] pr-6 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map((branch) => (
              <TableRow
                key={branch.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-foreground leading-tight">
                      {branch.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-muted-foreground text-sm max-w-[200px] truncate">
                  {branch.description || (
                    <span className="opacity-30 italic">Không có mô tả</span>
                  )}
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                    <Users className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-sm font-bold">
                      {branch._count?.members || 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/5 border border-slate-500/10">
                    <Receipt className="w-3.5 h-3.5 text-slate-500/60" />
                    <span className="text-sm font-bold">
                      {branch._count?.transactions || 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="pr-6 py-4 text-right">
                  {canManage && <ActionMenu branch={branch} onEdit={onEdit} onDelete={onDelete} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-border">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 active:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center border border-primary/10 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="font-bold text-foreground truncate leading-snug">
                  {branch.name}
                </h4>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {branch._count?.members || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {branch._count?.transactions || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {canManage && (
              <div className="shrink-0">
                <ActionMenu branch={branch} onEdit={onEdit} onDelete={onDelete} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
