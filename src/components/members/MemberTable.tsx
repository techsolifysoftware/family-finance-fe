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
import { Building2, Edit2, MoreHorizontal, Trash2, UserCheck } from "lucide-react";
import type { Member } from "@/types";

interface MemberTableProps {
  members: Member[];
  loading: boolean;
  canManage: boolean;
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
}

export function MemberTable({
  members,
  loading,
  canManage,
  onEdit,
  onDelete,
}: MemberTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted/30">
        <TableRow>
          <TableHead className="px-6">Họ và tên</TableHead>
          <TableHead>Thuộc chi nhánh</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                Đang tải dữ liệu...
              </div>
            </TableCell>
          </TableRow>
        ) : members.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="h-24 text-center text-muted-foreground"
            >
              Không tìm thấy thành viên nào.
            </TableCell>
          </TableRow>
        ) : (
          members.map((member) => (
            <TableRow key={member.id} className="group">
              <TableCell className="px-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ring-1 ring-primary/20">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-foreground">
                    {member.name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{member.branch?.name || "Vãng lai / Tự do"}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="success" className="font-medium">
                  <UserCheck className="w-3 h-3 mr-1" /> Đang hoạt động
                </Badge>
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
                      <DropdownMenuItem onClick={() => onEdit(member)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Sửa thông tin
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        onClick={() => {
                          if (window.confirm("Xóa thành viên này?")) {
                            onDelete(member.id);
                          }
                        }}
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
