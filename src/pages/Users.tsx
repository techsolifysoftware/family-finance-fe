import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "@/types";
import { UserTable } from "@/components/users/UserTable";
import { UserFormModal } from "@/components/users/UserFormModal";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "VIEWER",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      username: "",
      password: "",
      role: "VIEWER",
    });
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      username: user.username,
      password: "", // Không hiển thị mật khẩu cũ
      role: user.role,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
      toast.error("Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }

    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tài khoản này? Người dùng sẽ không thể đăng nhập được nữa.",
      )
    ) {
      try {
        await api.delete(`/users/${id}`);
        toast.success("Đã xóa tài khoản thành công");
        fetchUsers();
      } catch {
        toast.error("Có lỗi xảy ra khi xóa tài khoản");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { password, ...rest } = formData;
      const payload = editingId && !password ? rest : formData;

      if (editingId) {
        await api.patch(`/users/${editingId}`, payload);
        toast.success("Đã cập nhật tài khoản");
      } else {
        await api.post("/users", payload);
        toast.success("Đã tạo tài khoản thành công");
      }
      closeModal();
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message =
        error.response?.data?.message || "Lỗi khi lưu thông tin người dùng";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-0 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-6 sm:px-0">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Hệ thống quản trị
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
            Quản trị Tài khoản
          </h1>
          <p className="text-muted-foreground text-sm lg:text-lg max-w-xl font-bold opacity-60 leading-relaxed">
            Cấp quyền và quản lý danh tính các thành viên ban trị sự tham gia
            vận hành hệ thống.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:translate-y-0 h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary text-primary-foreground"
        >
          <Plus className="w-5 h-5 mr-3" /> Tạo tài khoản mới
        </Button>
      </div>

      <div className="grid gap-6 px-6 sm:px-0">
        <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem]">
          <CardContent className="p-0">
            <UserTable
              users={users}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
          <span>Tổng số: {users.length} tài khoản</span>
        </div>
      </div>

      <UserFormModal
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
