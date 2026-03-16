import { EventCard } from "@/components/events/EventCard";
import { EventFormModal } from "@/components/events/EventFormModal";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Event } from "@/types";
import { format } from "date-fns";
import { Plus, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Events() {
  const { canManageTransactions } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    budget: "",
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get("/events");
      setEvents(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      date: format(new Date(), "yyyy-MM-dd"),
      budget: "",
    });
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData({
      name: event.name,
      date: format(new Date(event.date), "yyyy-MM-dd"),
      budget: event.budget.toLocaleString("vi-VN"),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        await api.delete(`/events/${id}`);
        toast.success("Đã xóa sự kiện thành công");
        fetchEvents();
      } catch {
        toast.error(
          "Không thể xóa sự kiện này. Vui lòng kiểm tra các giao dịch liên quan.",
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budget = parseFloat(
      formData.budget.replace(/\./g, "").replace(/,/g, ""),
    );

    if (isNaN(budget) || budget < 0) {
      toast.warning("Vui lòng nhập kinh phí hợp lệ");
      return;
    }

    const payload = {
      name: formData.name,
      date: new Date(formData.date).toISOString(),
      budget: budget,
    };

    try {
      if (editingId) {
        await api.patch(`/events/${editingId}`, payload);
        toast.success("Đã cập nhật sự kiện");
      } else {
        await api.post("/events", payload);
        toast.success("Đã tạo sự kiện mới");
      }
      closeModal();
      fetchEvents();
    } catch {
      toast.error("Lỗi khi lưu sự kiện");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sự kiện & Dự toán
          </h1>
          <p className="text-muted-foreground mt-1">
            Lập kế hoạch và theo dõi ngân sách cho các công việc trong họ.
          </p>
        </div>
        {canManageTransactions && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Tạo sự kiện
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground animate-pulse">
            Đang tải danh sách sự kiện...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              canManage={canManageTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {events.length === 0 && (
            <Card className="col-span-full border-dashed border-2 bg-muted/20 py-16 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">Chưa có sự kiện nào</CardTitle>
              <CardDescription className="max-w-[300px] mt-2">
                Hãy bắt đầu lập kế hoạch cho các công việc của dòng họ bằng cách
                tạo sự kiện đầu tiên.
              </CardDescription>
              {canManageTransactions && (
                <Button onClick={() => setShowModal(true)} className="mt-6">
                  <Plus className="w-4 h-4 mr-2" /> Tạo sự kiện ngay
                </Button>
              )}
            </Card>
          )}
        </div>
      )}

      <EventFormModal
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
