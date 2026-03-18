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
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-0 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 sm:px-0">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
            Hội viên dòng họ
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Danh sách Thành viên
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base max-w-lg">
            Quản lý thông tin định danh các thành viên và phân loại theo chi
            nhánh trực thuộc trong dòng tộc.
          </p>
        </div>
        {canManageMembers && (
          <Button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 h-11 px-6 rounded-xl font-bold"
          >
            <Plus className="w-5 h-5 mr-2" /> Thêm thành viên
          </Button>
        )}
      </div>

      <div className="grid gap-4 px-4 sm:px-0">
        <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl ring-1 ring-border/50">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b border-border/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  placeholder="Tìm kiếm theo tên thành viên..."
                  className="pl-10 h-11 bg-background/50 border-border/60 focus:bg-background transition-all rounded-xl text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:flex-none">
                  <Select
                    value={selectedBranchFilter}
                    onValueChange={setSelectedBranchFilter}
                  >
                    <SelectTrigger className="w-full lg:w-[220px] h-11 bg-background/50 border-border/60 rounded-xl px-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground/60" />
                        <SelectValue placeholder="Tất cả chi nhánh" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60">
                      <SelectItem value="ALL" className="font-medium">
                        Tất cả chi nhánh
                      </SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

        <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
          <span>Tổng số: {filteredMembers.length} thành viên</span>
        </div>
      </div>

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
