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
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Events() {
  const navigate = useNavigate();
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
    <div className="space-y-10 lg:space-y-14 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20 px-0 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-6 sm:px-0">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            <Target className="w-3 h-3" />
            Quản lý mục tiêu
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-none">
            Sự kiện & Dự toán
          </h1>
          <p className="text-muted-foreground text-sm lg:text-lg max-w-xl font-medium leading-relaxed">
            Lập kế hoạch tài chính thông minh, theo dõi chi tiết các đợt đóng góp và tối ưu hóa ngân sách cho mọi hoạt động của dòng họ.
          </p>
        </div>
        {canManageTransactions && (
          <Button
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:translate-y-0 h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary text-primary-foreground"
          >
            <Plus className="w-5 h-5 mr-3" /> Tạo sự kiện mới
          </Button>
        )}
      </div>

      <div className="px-6 sm:px-0">
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 bg-card/30 backdrop-blur-sm rounded-[3rem] border border-dashed border-border/40">
            <div className="relative group">
              <div className="w-20 h-20 border-8 border-primary/10 rounded-[2rem] animate-pulse group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 w-20 h-20 border-8 border-primary border-t-transparent rounded-[2rem] animate-spin" />
            </div>
            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs animate-pulse">
              Đang đồng bộ dữ liệu...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                canManage={canManageTransactions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewStatus={setStatusModalEvent}
                onViewTransactions={(e) => navigate("/transactions", { state: { eventId: e.id.toString() } })}
              />
            ))}

            {events.length === 0 && !loading && (
              <Card className="col-span-full border-none shadow-2xl shadow-foreground/5 bg-card/50 backdrop-blur-xl rounded-[3rem] py-24 flex flex-col items-center justify-center text-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
                <div className="relative p-8 bg-primary/10 rounded-[2.5rem] mb-8 text-primary shadow-inner scale-125">
                  <Target className="w-10 h-10" />
                </div>
                <CardTitle className="text-3xl font-black tracking-tight mb-4">
                  Chưa có sự kiện nào
                </CardTitle>
                <CardDescription className="max-w-[400px] text-lg font-medium leading-relaxed opacity-70">
                  Hãy bắt đầu hành trình quản lý tài chính dòng họ bằng cách thiết lập sự kiện đầu tiên ngay hôm nay.
                </CardDescription>
                {canManageTransactions && (
                  <Button
                    onClick={() => setShowModal(true)}
                    className="mt-12 h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all bg-primary text-primary-foreground"
                  >
                    <Plus className="w-6 h-6 mr-3" /> Thiết lập ngay
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
