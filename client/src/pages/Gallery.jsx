import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCloudArrowUp, FaTrash } from "react-icons/fa6";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import api from "../services/api.js";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0 });

  async function load(page = pagination.page) {
    const { data } = await api.get("/gallery", { params: { page, limit: pagination.limit } });
    setItems(data.data || []);
    setPagination(data.pagination);
  }

  useEffect(() => { load(1); }, []);

  async function upload(event) {
    event.preventDefault();
    if (!files.length) return toast.error("Choose images first");
    const payload = new FormData();
    payload.append("title", title);
    files.forEach((file) => payload.append("images", file));
    await api.post("/gallery/upload", payload);
    toast.success("Images uploaded");
    setFiles([]); setTitle(""); load(1);
  }

  async function remove(id) {
    if (!confirm("Delete this image?")) return;
    await api.delete(`/gallery/${id}`);
    toast.success("Image deleted");
    load();
  }

  return (
    <>
      <PageHeader title="Gallery" subtitle="Upload and curate image archives in Supabase Storage." />
      <form onSubmit={upload} className="royal-panel mb-6 grid gap-4 rounded-xl p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <input className="input" placeholder="Shared title or caption" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="input" type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        <button className="btn-primary"><FaCloudArrowUp /> Upload</button>
      </form>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="royal-panel overflow-hidden rounded-xl">
            <img src={item.image_url} alt={item.alt_text || item.title} className="h-48 w-full object-cover" loading="lazy" />
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0"><p className="truncate font-semibold">{item.title}</p><p className="text-xs text-royalBrown/60 dark:text-white/50">{new Date(item.created_at).toLocaleDateString()}</p></div>
              <button className="btn-secondary px-3" onClick={() => remove(item.id)}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
      <Pagination page={pagination.page} total={pagination.total} limit={pagination.limit} onPage={load} />
    </>
  );
}
