import { MemberFormModal } from "@/components/members/MemberFormModal";
import { MemberTable } from "@/components/members/MemberTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Branch, Member } from "@/types";
import { Filter, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Members() {
  const { canManageMembers } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ name: "", branchId: "" });
  const [search, setSearch] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("ALL");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, branchesRes] = await Promise.all([
        api.get("/members"),
        api.get("/branches"),
      ]);
      setMembers(membersRes.data);
      setBranches(branchesRes.data);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách thành viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: "", branchId: "" });
  };

  const handleEdit = (member: Member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      branchId: member.branchId?.toString() || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageMembers) return;

    try {
      const payload = {
        name: formData.name,
        branchId: parseInt(formData.branchId),
      };

      if (editingId) {
        await api.patch(`/members/${editingId}`, payload);
        toast.success("Đã cập nhật thành viên");
      } else {
        await api.post("/members", payload);
        toast.success("Đã thêm thành viên mới");
      }
      closeModal();
      fetchData();
    } catch {
      toast.error("Có lỗi xảy ra khi lưu thành viên.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/members/${id}`);
      toast.success("Đã xóa thành viên");
      fetchData();
    } catch {
      toast.error(
        "Không thể xóa thành viên này. Vui lòng kiểm tra các giao dịch liên quan.",
      );
    }
  };

  const filteredMembers = members.filter((m: Member) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchBranch =
      selectedBranchFilter === "ALL" ||
      m.branchId?.toString() === selectedBranchFilter;
    return matchSearch && matchBranch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Thành viên dòng họ
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý định danh các thành viên và chi nhánh trực thuộc.
          </p>
        </div>
        {canManageMembers && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Thêm thành viên
          </Button>
        )}
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên thành viên..."
                className="pl-10 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedBranchFilter}
                onValueChange={setSelectedBranchFilter}
              >
                <SelectTrigger className="w-[180px] h-10">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Theo chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả chi nhánh</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <MemberTable
            members={filteredMembers}
            loading={loading}
            canManage={canManageMembers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <MemberFormModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        branches={branches}
      />
    </div>
  );
}
