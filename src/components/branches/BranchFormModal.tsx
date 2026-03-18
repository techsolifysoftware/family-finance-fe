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
import { Building2, FileText, Save, X } from "lucide-react";

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    description: string;
  };
  setFormData: (data: { name: string; description: string }) => void;
  editingId: number | null;
}

export function BranchFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingId,
}: BranchFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 px-6 py-6 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {editingId ? (
                  <Save className="w-5 h-5" />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
              </div>
              {editingId ? "Sửa Chi Nhánh" : "Thêm Chi Nhánh"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1.5 ml-13">
              Quản lý danh tính các chi hội trong phả hệ dòng họ điện tử.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2.5">
              <Label
                htmlFor="branch-name"
                className="text-sm font-bold flex items-center gap-2 px-1"
              >
                <Building2 className="w-3.5 h-3.5 text-primary/60" /> Tên chi
                nhánh / Chi hội
              </Label>
              <Input
                id="branch-name"
                placeholder="Ví dụ: Chi Trưởng, Chi Thứ 2..."
                className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-all rounded-xl pl-4 font-semibold"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="branch-desc"
                className="text-sm font-bold flex items-center gap-2 px-1"
              >
                <FileText className="w-3.5 h-3.5 text-primary/60" /> Mô tả ngắn
              </Label>
              <Input
                id="branch-desc"
                placeholder="Thông tin giới thiệu về chi..."
                className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-all rounded-xl pl-4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
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
              {editingId ? "Lưu thay đổi" : "Tạo chi hội"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
