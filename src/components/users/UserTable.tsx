import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit2,
  Trash2,
  MoreHorizontal,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from "lucide-react";
import type { User } from "@/types";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case "ADMIN":
      return (
        <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 border-rose-500/20 px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider">
          <ShieldAlert className="w-3 h-3 mr-1.5" /> Quản trị viên
        </Badge>
      );
    case "MANAGER":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-blue-500/20 px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3 mr-1.5" /> Quản lý
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/5 text-slate-500 border-slate-500/10 px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider"
        >
          <Shield className="w-3 h-3 mr-1.5" /> Người xem
        </Badge>
      );
  }
};

interface ActionMenuProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

const ActionMenu = ({ user, onEdit, onDelete }: ActionMenuProps) => (
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
        onClick={() => onEdit(user)}
        className="cursor-pointer"
      >
        <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        onClick={() => onDelete(user.id)}
      >
        <Trash2 className="w-4 h-4 mr-2" /> Xóa tài khoản
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">
          Đang tải danh sách tài khoản...
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
          <UserIcon className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">Chưa có người dùng nào</h3>
        <p className="text-muted-foreground max-w-xs">
          Hệ thống hiện chưa có tài khoản nào được tạo.
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
            <TableRow className="hover:bg-transparent text-center">
              <TableHead className="pl-6 py-4 font-bold text-foreground">
                Họ và tên
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground">
                Tên đăng nhập
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground text-center">
                Quyền hạn
              </TableHead>
              <TableHead className="w-[80px] pr-6 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-sm font-bold shadow-sm ring-1 ring-primary/20 shrink-0">
                      {user.name.split(" ").pop()?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground leading-tight">
                        {user.name}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 font-medium text-primary/80">
                  @{user.username}
                </TableCell>
                <TableCell className="py-4 text-center">
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell className="pr-6 py-4 text-right">
                  <ActionMenu user={user} onEdit={onEdit} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-border">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 active:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-sm font-bold shadow-sm border border-primary/10">
                {user.name.split(" ").pop()?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="font-bold text-foreground truncate leading-snug">
                  {user.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-primary/70 font-medium truncate">
                    @{user.username}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <ActionMenu user={user} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
