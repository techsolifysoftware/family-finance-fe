import { BranchFormModal } from "@/components/branches/BranchFormModal";
import { BranchTable } from "@/components/branches/BranchTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Branch } from "@/types";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Branches() {
  const { canManageMembers } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get("/branches");
      setBranches(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách chi nhánh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  const handleEdit = (branch: Branch) => {
    setEditingId(branch.id);
    setFormData({
      name: branch.name,
      description: branch.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageMembers) return;

    try {
      if (editingId) {
        await api.patch(`/branches/${editingId}`, formData);
        toast.success("Đã cập nhật chi nhánh");
      } else {
        await api.post("/branches", formData);
        toast.success("Đã thêm chi nhánh mới");
      }
      closeModal();
      fetchBranches();
    } catch {
      toast.error(
        "Có lỗi xảy ra khi lưu chi nhánh. Tên chi nhánh có thể đã tồn tại.",
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Xóa chi nhánh này? Lưu ý: Chỉ xóa được nếu không có thành viên hoặc giao dịch nào thuộc chi nhánh này.",
      )
    )
      return;
    try {
      await api.delete(`/branches/${id}`);
      toast.success("Đã xóa chi nhánh");
      fetchBranches();
    } catch {
      toast.error(
        "Không thể xóa chi nhánh này. Vui lòng kiểm tra xem có thành viên nào thuộc chi nhánh này không.",
      );
    }
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-0 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 sm:px-0">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-2">
            Phí & Phân cấp dòng họ
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Cơ cấu Chi họ
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base max-w-lg">
            Quản lý các chi hội (Chi Trưởng, Chi Thứ, Chi Út...) phục vụ công
            tác thống kê và phân loại hội viên.
          </p>
        </div>
        {canManageMembers && (
          <Button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 h-11 px-6 rounded-xl font-bold"
          >
            <Plus className="w-5 h-5 mr-2" /> Thêm chi nhánh mới
          </Button>
        )}
      </div>

      <div className="grid gap-4 px-4 sm:px-0">
        <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl ring-1 ring-border/50">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b border-border/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  placeholder="Tìm kiếm theo tên chi..."
                  className="pl-10 h-11 bg-background/50 border-border/60 focus:bg-background transition-all rounded-xl text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <BranchTable
              branches={filteredBranches}
              loading={loading}
              canManage={canManageMembers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
        <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
          <span>Tổng số: {filteredBranches.length} chi nhánh</span>
        </div>
      </div>

      <BranchFormModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
      />
    </div>
  );
}
