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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
          </DialogTitle>
          <DialogDescription>
            {editingId 
              ? "Thay đổi thông tin người dùng. Để mật khẩu trống nếu không muốn đổi." 
              : "Cấp quyền truy cập hệ thống cho thành viên mới."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="u-name">Họ và tên</Label>
            <Input
              id="u-name"
              placeholder="VD: Nguyễn Văn A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="u-username">Tên đăng nhập</Label>
            <Input
              id="u-username"
              placeholder="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={!!editingId} // Thường không nên đổi username sau khi tạo
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="u-password">
              {editingId ? "Mật khẩu mới (Tùy chọn)" : "Mật khẩu"}
            </Label>
            <Input
              id="u-password"
              type="password"
              placeholder={editingId ? "••••••••" : "Nhập mật khẩu"}
              value={formData.password || ""}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="u-role">Quyền hạn</Label>
            <Select
              value={formData.role}
              onValueChange={(val) => setFormData({ ...formData, role: val })}
            >
              <SelectTrigger id="u-role">
                <SelectValue placeholder="Chọn quyền" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Người xem (Chỉ xem)</SelectItem>
                <SelectItem value="MANAGER">Quản lý (Ghi chép thu chi)</SelectItem>
                <SelectItem value="ADMIN">Quản trị viên (Toàn quyền)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">
              {editingId ? "Lưu thay đổi" : "Tạo tài khoản"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
