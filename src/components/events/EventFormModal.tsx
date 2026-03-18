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
import { Plus, ListTodo, Target, Trash2, Save } from "lucide-react";
import { useState } from "react";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    date: string;
    budget: string;
  };
  setFormData: (data: { name: string; date: string; budget: string }) => void;
  editingId: number | null;
  rounds: { name: string; id?: number }[];
  setRounds: React.Dispatch<React.SetStateAction<{ name: string; id?: number }[]>>;
}

export function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingId,
  rounds,
  setRounds,
}: EventFormModalProps) {
  const [newRoundName, setNewRoundName] = useState("");

  const addRound = () => {
    if (!newRoundName.trim()) return;
    setRounds([...rounds, { name: newRoundName }]);
    setNewRoundName("");
  };

  const removeRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") return "";
    return parseInt(numericValue).toLocaleString("vi-VN");
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      budget: formatCurrencyInput(e.target.value),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Cập nhật sự kiện" : "Tạo sự kiện mới"}
          </DialogTitle>
          <DialogDescription>
            Thiết kế kế hoạch cho các hoạt động hoặc dự toán sắp tới.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên sự kiện / Dự toán</Label>
            <div className="relative">
              <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Ví dụ: Giỗ tổ 2024, Xây nhà thờ..."
                className="pl-10"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày diễn ra</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Dự toán kinh phí (₫)</Label>
              <Input
                id="budget"
                placeholder="0"
                value={formData.budget}
                onChange={handleBudgetChange}
                required
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4 mt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-500" />
                Các đợt đóng (Payment Rounds)
              </Label>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase">
                {rounds.length} Đợt
              </span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Tên đợt (Ví dụ: Đợt 1 - Cọc tiền)"
                value={newRoundName}
                onChange={(e) => setNewRoundName(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addRound())
                }
                className="h-9 text-sm"
              />
              <Button
                type="button"
                onClick={addRound}
                size="sm"
                className="h-9 px-3 shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" /> Thêm
              </Button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
              {rounds.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    Chưa có đợt đóng nào được thêm
                  </p>
                </div>
              ) : (
                rounds.map((round, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 bg-card border rounded-xl group transition-all hover:border-indigo-200 hover:shadow-sm"
                  >
                    <span className="text-sm font-medium pl-1">
                      {round.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRound(index)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl h-11"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-11 px-8 shadow-lg shadow-primary/20"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingId ? "Cập nhật" : "Tạo sự kiện"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
