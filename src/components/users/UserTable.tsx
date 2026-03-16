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
import { Edit2, Trash2 } from "lucide-react";
import type { User } from "@/types";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Đang tải danh sách người dùng...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-muted/20">
        Chưa có người dùng nào được tạo.
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">
            Quản trị viên
          </Badge>
        );
      case "MANAGER":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
            Quản lý
          </Badge>
        );
      default:
        return <Badge variant="secondary">Người xem</Badge>;
    }
  };

  return (
    <div className="rounded-md border-none overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold">Họ và tên</TableHead>
            <TableHead className="font-bold">Tên đăng nhập</TableHead>
            <TableHead className="font-bold">Quyền hạn</TableHead>
            <TableHead className="text-right font-bold pr-6">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <TableCell className="font-medium py-3.5">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">
                @{user.username}
              </TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell className="text-right pr-4">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => onEdit(user)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
