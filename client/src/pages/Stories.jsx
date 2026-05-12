import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa6";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import api from "../services/api.js";

export default function Stories() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", category: "", status: "" });
  const search = useDebounce(filters.search);

  async function load(page = pagination.page) {
    const { data } = await api.get("/stories", { params: { ...filters, search, page, limit: pagination.limit } });
    setItems(data.data || []);
    setPagination(data.pagination);
  }

  useEffect(() => { load(1); }, [search, filters.category, filters.status]);

  async function remove(id) {
    if (!confirm("Delete this story?")) return;
    await api.delete(`/stories/${id}`);
    toast.success("Story deleted");
    load();
  }

  return (
    <>
      <PageHeader title="Stories" subtitle="Create, publish and refine historical narratives." action={<Link className="btn-primary" to="/stories/new"><FaPlus /> New Story</Link>} />
      <div className="royal-panel rounded-xl p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="input" placeholder="Search stories" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <select className="input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All categories</option><option>History</option><option>Battle</option><option>Fort</option><option>Biography</option>
          </select>
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-royalBrown/60 dark:text-white/50"><tr><th className="py-3">Title</th><th>Category</th><th>Status</th><th>Updated</th><th className="text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-amber-100 dark:divide-white/10">
              {items.map((story) => (
                <tr key={story.id}>
                  <td className="py-4 font-semibold">{story.title}</td><td>{story.category}</td>
                  <td><span className="rounded-full bg-saffron/15 px-3 py-1 text-xs font-bold text-royalBrown dark:text-saffron">{story.status}</span></td>
                  <td>{new Date(story.updated_at).toLocaleDateString()}</td>
                  <td className="space-x-2 text-right"><Link className="btn-secondary px-3" to={`/stories/${story.id}/edit`}><FaPen /></Link><button className="btn-secondary px-3" onClick={() => remove(story.id)}><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} total={pagination.total} limit={pagination.limit} onPage={load} />
      </div>
    </>
  );
}
