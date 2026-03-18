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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 sm:px-0">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Quản trị Tài khoản
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base max-w-lg">
            Cấp quyền và quản lý danh tính các thành viên ban trị sự tham gia
            vận hành hệ thống.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 h-11 px-6 rounded-xl font-bold"
        >
          <Plus className="w-5 h-5 mr-2" /> Tạo tài khoản mới
        </Button>
      </div>

      <div className="grid gap-4 px-4 sm:px-0">
        <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl ring-1 ring-border/50">
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
