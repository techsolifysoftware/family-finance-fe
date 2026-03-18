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
import {
  Building2,
  Edit2,
  MoreHorizontal,
  Trash2,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import type { Member } from "@/types";

interface MemberTableProps {
  members: Member[];
  loading: boolean;
  canManage: boolean;
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
}

interface ActionMenuProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
}

const ActionMenu = ({ member, onEdit, onDelete }: ActionMenuProps) => (
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
        onClick={() => onEdit(member)}
        className="cursor-pointer"
      >
        <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        onClick={() => {
          if (window.confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
            onDelete(member.id);
          }
        }}
      >
        <Trash2 className="w-4 h-4 mr-2" /> Xóa hội viên
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export function MemberTable({
  members,
  loading,
  canManage,
  onEdit,
  onDelete,
}: MemberTableProps) {
  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">
          Đang tải dữ liệu thành viên...
        </p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
          <Building2 className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">Không tìm thấy thành viên</h3>
        <p className="text-muted-foreground max-w-xs">
          Hệ thống không tìm thấy kết quả phù hợp với tiêu chí tìm kiếm của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 py-4 font-bold text-foreground">
                Thành viên
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground inline-flex items-center gap-2">
                Chi nhánh
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground">
                Mô tả
              </TableHead>
              <TableHead className="py-4 font-bold text-foreground text-center">
                Trạng thái
              </TableHead>
              <TableHead className="w-[80px] pr-6 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow
                key={member.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-sm font-bold shadow-sm ring-1 ring-primary/20">
                        {member.name.split(" ").pop()?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background flex items-center justify-center shadow-sm">
                        <ShieldCheck className="w-2.5 h-2.5 text-success fill-success" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground leading-tight">
                        {member.name}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-muted/60">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {member.branch?.name || "Chi hội Tự do"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 max-w-[200px]">
                  <span
                    className="text-sm text-muted-foreground line-clamp-2"
                    title={member.description}
                  >
                    {member.description || "-"}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider"
                  >
                    <UserCheck className="w-3 h-3 mr-1.5" /> Thành viên
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 py-4 text-right">
                  {canManage && <ActionMenu member={member} onEdit={onEdit} onDelete={onDelete} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-border">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-4 flex flex-col gap-3 hover:bg-muted/20 active:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-sm font-bold shadow-sm border border-primary/10">
                  {member.name.split(" ").pop()?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-bold text-foreground truncate leading-snug">
                    {member.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {member.branch?.name || "Tự do"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                      Hoạt động
                    </span>
                  </div>
                </div>
              </div>

              {canManage && (
                <div className="shrink-0">
                  <ActionMenu member={member} onEdit={onEdit} onDelete={onDelete} />
                </div>
              )}
            </div>

            {member.description && (
              <div className="px-1">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-muted/30 p-2 rounded-lg border border-border/40">
                  {member.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
