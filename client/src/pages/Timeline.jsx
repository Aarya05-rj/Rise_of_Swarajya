import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa6";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import api from "../services/api.js";

const empty = { title: "", description: "", event_date: "", category: "Event", location: "" };

export default function Timeline() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);
  const [editing, setEditing] = useState(null);

  async function load(page = pagination.page) {
    const { data } = await api.get("/events", { params: { page, limit: pagination.limit } });
    setEvents(data.data || []);
    setPagination(data.pagination);
  }

  useEffect(() => { load(1); }, []);

  async function submit(event) {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value || ""));
    if (image) payload.append("image", image);
    if (editing) await api.put(`/events/${editing}`, payload);
    else await api.post("/events", payload);
    toast.success(editing ? "Event updated" : "Event added");
    setForm(empty); setImage(null); setEditing(null); load();
  }

  function edit(item) {
    setEditing(item.id);
    setForm({ title: item.title, description: item.description, event_date: item.event_date, category: item.category, location: item.location || "" });
  }

  async function remove(id) {
    if (!confirm("Delete this event?")) return;
    await api.delete(`/events/${id}`);
    toast.success("Event deleted");
    load();
  }

  return (
    <>
      <PageHeader title="Timeline Management" subtitle="Maintain battles, coronations, treaties and milestones in chronological order." />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={submit} className="royal-panel grid gap-4 rounded-xl p-5">
          <h3 className="font-display text-xl font-bold">{editing ? "Edit Event" : "Add Event"}</h3>
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Event</option><option>Battle</option><option>Coronation</option><option>Fort</option><option>Treaty</option></select>
          <input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <textarea className="input min-h-28" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input className="input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          <button className="btn-primary">{editing ? "Update Event" : "Add Event"}</button>
        </form>
        <section className="royal-panel rounded-xl p-5">
          <div className="space-y-3">
            {events.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-xl border border-amber-100 p-4 dark:border-white/10 md:grid-cols-[100px_1fr_auto]">
                <div className="font-display text-lg font-bold text-saffron">{item.event_date}</div>
                <button className="text-left" onClick={() => edit(item)}><p className="font-bold">{item.title}</p><p className="text-sm text-royalBrown/60 dark:text-white/60">{item.category} {item.location ? `- ${item.location}` : ""}</p></button>
                <button className="btn-secondary px-3" onClick={() => remove(item.id)}><FaTrash /></button>
              </div>
            ))}
          </div>
          <Pagination page={pagination.page} total={pagination.total} limit={pagination.limit} onPage={load} />
        </section>
      </div>
    </>
  );
}
