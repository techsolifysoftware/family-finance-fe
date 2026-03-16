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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cơ cấu chi họ</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các chi nhánh (Chi Trưởng, Chi Thứ, Chi Út...) trong dòng
            họ.
          </p>
        </div>
        {canManageMembers && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Thêm chi nhánh
          </Button>
        )}
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên chi..."
                className="pl-10 h-10"
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
