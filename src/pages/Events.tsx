import { EventCard } from "@/components/events/EventCard";
import { EventFormModal } from "@/components/events/EventFormModal";
import { EventPaymentStatusModal } from "@/components/events/EventPaymentStatusModal";
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
  const [statusModalEvent, setStatusModalEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    budget: "",
  });
  const [rounds, setRounds] = useState<{ name: string; id?: number }[]>([]);

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
    setRounds([]);
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData({
      name: event.name,
      date: format(new Date(event.date), "yyyy-MM-dd"),
      budget: event.budget.toLocaleString("vi-VN"),
    });
    setRounds((event.rounds || []).map((r) => ({ name: r.name, id: r.id })));
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
      rounds: rounds.filter((r) => !r.id).map((r) => ({ name: r.name })),
    };

    try {
      if (editingId) {
        await api.patch(`/events/${editingId}`, payload);

        // Handle rounds management for existing event
        const event = events.find((e) => e.id === editingId);
        if (event) {
          const oldRounds = event.rounds || [];

          // Delete rounds that are no longer in the list
          const roundsToDelete = oldRounds.filter(
            (old) => !rounds.some((r) => r.id === old.id),
          );
          for (const r of roundsToDelete) {
            await api.delete(`/events/rounds/${r.id}`);
          }

          // Update existing rounds or create new ones
          for (const r of rounds) {
            if (r.id) {
              const old = oldRounds.find((o) => o.id === r.id);
              if (old && old.name !== r.name) {
                await api.patch(`/events/rounds/${r.id}`, { name: r.name });
              }
            } else {
              await api.post(`/events/rounds`, {
                name: r.name,
                eventId: editingId,
              });
            }
          }
        }

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
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-0 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 sm:px-0">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Sự kiện & Dự toán
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base max-w-lg">
            Lập kế hoạch và theo dõi các đợt đóng góp cũng như chi tiêu cho các
            công việc của dòng họ.
          </p>
        </div>
        {canManageTransactions && (
          <Button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 h-11 px-6 rounded-xl font-bold"
          >
            <Plus className="w-5 h-5 mr-2" /> Tạo sự kiện mới
          </Button>
        )}
      </div>

      <div className="px-4 sm:px-0">
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">
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
                onViewStatus={setStatusModalEvent}
              />
            ))}

            {events.length === 0 && !loading && (
              <Card className="col-span-full border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm rounded-3xl py-16 flex flex-col items-center justify-center text-center">
                <div className="p-5 bg-primary/10 rounded-2xl mb-4 text-primary">
                  <Target className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl font-bold">
                  Chưa có sự kiện nào
                </CardTitle>
                <CardDescription className="max-w-[320px] mt-2 text-base">
                  Hãy bắt đầu lập kế hoạch cho các công việc của dòng họ bằng
                  cách tạo sự kiện đầu tiên.
                </CardDescription>
                {canManageTransactions && (
                  <Button
                    onClick={() => setShowModal(true)}
                    className="mt-8 h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Tạo sự kiện ngay
                  </Button>
                )}
              </Card>
            )}
          </div>
        )}
      </div>

      <EventFormModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        rounds={rounds}
        setRounds={setRounds}
      />

      {statusModalEvent && (
        <EventPaymentStatusModal
          isOpen={!!statusModalEvent}
          onClose={() => setStatusModalEvent(null)}
          eventId={statusModalEvent.id}
          eventName={statusModalEvent.name}
        />
      )}
    </div>
  );
}
