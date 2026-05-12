import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import api from "../services/api.js";
import { slugify } from "../utils/slug.js";

const empty = { title: "", slug: "", excerpt: "", content: "", category: "History", status: "draft" };

export default function StoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [cover, setCover] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) api.get(`/stories/${id}`).then(({ data }) => setForm(data.data));
  }, [id]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value, slug: field === "title" && !id ? slugify(value) : current.slug }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value || ""));
    if (cover) payload.append("cover", cover);

    try {
      if (id) await api.put(`/stories/${id}`, payload);
      else await api.post("/stories", payload);
      toast.success(id ? "Story updated" : "Story created");
      navigate("/stories");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save story");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title={id ? "Edit Story" : "Add Story"} subtitle="Shape historical writing with rich text, categories and publish workflow." action={<Link className="btn-secondary" to="/stories">Back</Link>} />
      <form onSubmit={submit} className="royal-panel grid gap-5 rounded-xl p-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <input className="input" placeholder="Story title" value={form.title || ""} onChange={(e) => update("title", e.target.value)} required />
          <input className="input" placeholder="story-slug" value={form.slug || ""} onChange={(e) => update("slug", e.target.value)} required />
          <select className="input" value={form.category || "History"} onChange={(e) => update("category", e.target.value)}>
            <option>History</option><option>Battle</option><option>Fort</option><option>Biography</option><option>Culture</option>
          </select>
          <select className="input" value={form.status || "draft"} onChange={(e) => update("status", e.target.value)}>
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </div>
        <textarea className="input min-h-24" placeholder="Short excerpt" value={form.excerpt || ""} onChange={(e) => update("excerpt", e.target.value)} />
        <input className="input" type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} />
        {form.cover_image_url && <img className="h-40 w-full rounded-xl object-cover" src={form.cover_image_url} alt={form.title} />}
        <ReactQuill theme="snow" value={form.content || ""} onChange={(value) => update("content", value)} className="bg-white dark:bg-transparent" />
        <div className="flex justify-end gap-3"><Link className="btn-secondary" to="/stories">Cancel</Link><button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Story"}</button></div>
      </form>
    </>
  );
}
