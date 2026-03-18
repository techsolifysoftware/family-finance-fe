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
import type { Branch } from "@/types";
import { User, Building, Save, X } from "lucide-react";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: { name: string; branchId: string };
  setFormData: (data: { name: string; branchId: string }) => void;
  editingId: number | null;
  branches: Branch[];
}

export function MemberFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingId,
  branches,
}: MemberFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 px-6 py-6 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {editingId ? <Save className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              {editingId ? "Cập nhật thành viên" : "Thêm thành viên"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1.5 ml-12">
              Điền thông tin chi tiết của thành viên mới vào hệ thống quản lý dòng họ.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-sm font-bold flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary/60" /> Họ và tên hội viên
              </Label>
              <Input
                id="name"
                placeholder="Ví dụ: Nguyễn Văn A"
                className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-all rounded-xl pl-4"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            
            <div className="space-y-2.5">
              <Label htmlFor="branch" className="text-sm font-bold flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-primary/60" /> Chi nhánh / Hội trực thuộc
              </Label>
              <Select
                value={formData.branchId}
                onValueChange={(val) =>
                  setFormData({ ...formData, branchId: val })
                }
              >
                <SelectTrigger id="branch" className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-all rounded-xl pl-4">
                  <SelectValue placeholder="Chọn một chi nhánh..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()} className="cursor-pointer">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
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
              {editingId ? "Cập nhật" : "Lưu thành viên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
