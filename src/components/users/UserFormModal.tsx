import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User as UserIcon, Lock, Shield, AtSign, Save, X } from "lucide-react";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    username: string;
    password: string;
    name: string;
    role: string;
  };
  setFormData: (data: { username: string; password: string; name: string; role: string }) => void;
  editingId: number | null;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingId,
}: UserFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 px-6 py-6 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {editingId ? <Save className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
              </div>
              {editingId ? "Cập nhật tài khoản" : "Tạo tài khoản"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1.5 ml-12">
              {editingId 
                ? "Điều chỉnh thông tin hoặc phân quyền lại cho tài khoản người dùng." 
                : "Cấp tài khoản đăng nhập và phân quyền truy cập cho nhân sự mới."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u-name" className="text-sm font-bold flex items-center gap-2 px-1">
                <UserIcon className="w-3.5 h-3.5 text-primary/60" /> Họ và tên người dùng
              </Label>
              <Input
                id="u-name"
                placeholder="VD: Nguyễn Văn A"
                className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-all rounded-xl pl-4"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-username" className="text-sm font-bold flex items-center gap-2 px-1">
                <AtSign className="w-3.5 h-3.5 text-primary/60" /> Tên đăng nhập
              </Label>
              <Input
                id="u-username"
                placeholder="username (viết liền, không dấu)"
                className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-all rounded-xl pl-4 font-medium"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={!!editingId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-password" className="text-sm font-bold flex items-center gap-2 px-1">
                <Lock className="w-3.5 h-3.5 text-primary/60" /> {editingId ? "Mật khẩu mới (Tùy chọn)" : "Mật khẩu đăng nhập"}
              </Label>
              <Input
                id="u-password"
                type="password"
                placeholder={editingId ? "Để trống nếu không muốn đổi" : "Tối thiểu 6 ký tự"}
                className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-all rounded-xl pl-4"
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-role" className="text-sm font-bold flex items-center gap-2 px-1">
                <Shield className="w-3.5 h-3.5 text-primary/60" /> Phân quyền hệ thống
              </Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger id="u-role" className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-all rounded-xl pl-4">
                  <SelectValue placeholder="Chọn quyền hạn" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="VIEWER" className="py-2.5">
                    <span className="font-semibold">Người xem</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Chỉ xem báo cáo, không thể sửa đổi</p>
                  </SelectItem>
                  <SelectItem value="MANAGER" className="py-2.5">
                    <span className="font-semibold">Quản lý</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Được phép ghi chép các giao dịch thu chi</p>
                  </SelectItem>
                  <SelectItem value="ADMIN" className="py-2.5">
                    <span className="font-semibold">Quản trị viên</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Toàn quyền hệ thống & quản lý tài khoản</p>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-xl h-12 px-6 font-semibold hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4 mr-2" /> Hủy bỏ
            </Button>
            <Button 
              type="submit"
              className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
            >
              {editingId ? "Lưu thay đổi" : "Kích hoạt tài khoản"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
