'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const EMPTY_FORM = {
  name: '', description: '', address: '', category: 'aesthetic',
  rating: '', priceRange: '$$', facilities: '', openHours: '', mapsLink: '', image: '',
};

const CATEGORIES = ['aesthetic', 'coworking', 'outdoor', 'rooftop', 'traditional'];
const PRICE_RANGES = ['$', '$$', '$$$'];

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editCafe, setEditCafe] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchCafes = useCallback(async (tok) => {
    try {
      const res = await fetch(`${API_URL}/api/cafes`);
      const data = await res.json();
      if (data.success) setCafes(data.data);
    } catch {
      showToast('Gagal memuat data cafe.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (!stored) { router.replace('/admin'); return; }
    setToken(stored);
    fetchCafes(stored);
  }, [router, fetchCafes]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.replace('/admin');
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setEditCafe(null);
    setModal('add');
  };

  const openEdit = (cafe) => {
    setForm({
      name: cafe.name || '',
      description: cafe.description || '',
      address: cafe.address || '',
      category: cafe.category || 'aesthetic',
      rating: cafe.rating ?? '',
      priceRange: cafe.priceRange || '$$',
      facilities: Array.isArray(cafe.facilities) ? cafe.facilities.join(', ') : (cafe.facilities || ''),
      openHours: cafe.openHours || '',
      mapsLink: cafe.mapsLink || '',
      image: cafe.image || '',
    });
    setImageFile(null);
    setEditCafe(cafe);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditCafe(null); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const fd = new FormData();
    fd.append('image', imageFile);
    const res = await fetch(`${API_URL}/api/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json();
    if (data.success) return data.data.url;
    throw new Error(data.message || 'Upload gagal');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = form.image;
      if (imageFile) imageUrl = await uploadImage();

      const payload = {
        ...form,
        rating: parseFloat(form.rating) || 0,
        facilities: form.facilities.split(',').map(f => f.trim()).filter(Boolean),
        image: imageUrl,
      };

      const url = modal === 'edit'
        ? `${API_URL}/api/admin/cafes/${editCafe._id}`
        : `${API_URL}/api/admin/cafes`;
      const method = modal === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Gagal menyimpan');

      showToast(modal === 'edit' ? '✅ Cafe berhasil diupdate!' : '✅ Cafe berhasil ditambahkan!');
      closeModal();
      fetchCafes(token);
    } catch (err) {
      showToast('❌ ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cafe) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/cafes/${cafe._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('🗑️ Cafe berhasil dihapus.');
      setConfirmDelete(null);
      fetchCafes(token);
    } catch (err) {
      showToast('❌ ' + (err.message || 'Gagal menghapus'));
    }
  };

  return (
    <div className="min-h-screen bg-warm">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white shadow-lg rounded-xl px-5 py-3 text-sm font-medium border border-gray-100">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <div>
              <h1 className="font-display font-bold text-primary text-lg leading-none">Admin Panel</h1>
              <p className="text-xs text-gray-400">Cafe Makassar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{cafes.length} cafe</span>
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-gradient-cafe text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all"
            >
              + Tambah Cafe
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Cafe Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Memuat data cafe...</div>
        ) : cafes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Belum ada cafe. Klik "+ Tambah Cafe".</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cafes.map(cafe => (
              <div key={cafe._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="relative h-36 bg-gray-100">
                  {cafe.image ? (
                    <img src={cafe.image} alt={cafe.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">☕</div>
                  )}
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {cafe.category}
                  </span>
                  <span className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                    ⭐ {cafe.rating}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-800 truncate">{cafe.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{cafe.address}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cafe.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(cafe)}
                      className="flex-1 py-1.5 text-xs border border-secondary text-secondary rounded-lg hover:bg-secondary/10 transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(cafe)}
                      className="flex-1 py-1.5 text-xs border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-all"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center py-6 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-display font-bold text-primary">
                {modal === 'add' ? '☕ Tambah Cafe Baru' : '✏️ Edit Cafe'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nama Cafe *</label>
                <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="input-field" placeholder="Nama cafe..." />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Deskripsi *</label>
                <textarea required value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  rows={3} className="input-field resize-none" placeholder="Deskripsi singkat cafe..." />
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Alamat *</label>
                <input required value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}
                  className="input-field" placeholder="Jl. ..." />
              </div>

              {/* Category + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Kategori</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Harga</label>
                  <select value={form.priceRange} onChange={e => setForm(f => ({...f, priceRange: e.target.value}))} className="input-field">
                    {PRICE_RANGES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Rating + Open Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Rating (0–5)</label>
                  <input type="number" step="0.1" min="0" max="5" value={form.rating}
                    onChange={e => setForm(f => ({...f, rating: e.target.value}))}
                    className="input-field" placeholder="4.5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Jam Buka</label>
                  <input value={form.openHours} onChange={e => setForm(f => ({...f, openHours: e.target.value}))}
                    className="input-field" placeholder="09:00 - 22:00" />
                </div>
              </div>

              {/* Facilities */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Fasilitas <span className="font-normal text-gray-400">(pisah koma)</span></label>
                <input value={form.facilities} onChange={e => setForm(f => ({...f, facilities: e.target.value}))}
                  className="input-field" placeholder="WiFi, AC, Coffee Bar, Parking" />
              </div>

              {/* Maps Link */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Link Google Maps</label>
                <input type="url" value={form.mapsLink} onChange={e => setForm(f => ({...f, mapsLink: e.target.value}))}
                  className="input-field" placeholder="https://maps.app.goo.gl/..." />
              </div>

              {/* Image */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Foto Cafe</label>
                <div className="space-y-2">
                  <input type="file" accept="image/*" onChange={handleImageChange}
                    className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-secondary/10 file:text-secondary file:text-xs hover:file:bg-secondary/20" />
                  {!imageFile && (
                    <input value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))}
                      className="input-field text-xs" placeholder="Atau masukkan URL foto..." />
                  )}
                  {(imageFile || form.image) && (
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : form.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-xl"
                      onError={e => e.target.style.display='none'}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-cafe text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-60">
                  {saving ? 'Menyimpan...' : (modal === 'edit' ? 'Simpan Perubahan' : 'Tambah Cafe')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="font-bold text-gray-800 mb-2">Hapus Cafe?</h3>
              <p className="text-sm text-gray-500 mb-5">
                <strong>{confirmDelete.name}</strong> akan dihapus permanen dari database.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
