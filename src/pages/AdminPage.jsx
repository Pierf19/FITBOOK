import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AdminPage() {
  const users = useQuery(api.users.getAllUsers) || [];
  const createUser = useMutation(api.users.createUserAdmin);
  const updateUser = useMutation(api.users.updateUserAdmin);
  const deleteUser = useMutation(api.users.deleteUserAdmin);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", role: "user", status: "Active", email: "" });

  const handleOpenForm = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: "", role: "User", status: "Active", email: "" });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateUser({
          userId: editingItem._id,
          name: formData.name,
          email: formData.email,
          role: formData.role.toLowerCase(),
          status: formData.status
        });
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          role: formData.role.toLowerCase(),
          status: formData.status
        });
      }
      handleCloseForm();
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan data.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await deleteUser({ userId: id });
      } catch (err) {
        alert("Terjadi kesalahan saat menghapus data.");
        console.error(err);
      }
    }
  };

  const renderTable = (title, role) => {
    const filteredItems = users.filter(item => item.role === role);
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-4">{title}</h2>
        <div className="bg-[#111] rounded-3xl border border-[#222] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#151515] border-b border-[#222]">
                  <th className="p-6 text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">Nama</th>
                  <th className="p-6 text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">Email</th>
                  <th className="p-6 text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">Status</th>
                  <th className="p-6 text-xs font-bold text-gray-600 uppercase tracking-[0.2em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-gray-500 italic">Tidak ada data.</td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item._id} className="border-b border-[#222] hover:bg-[#151515] transition-colors">
                      <td className="p-6 text-white font-bold">{item.name}</td>
                      <td className="p-6 text-gray-400">{item.email}</td>
                      <td className="p-6">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${item.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {item.status || "Active"}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenForm({ ...item, role: item.role === "trainer" ? "Trainer" : "User" })}
                            className="text-xs text-gray-400 hover:text-white transition-colors uppercase font-bold tracking-wider"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-xs text-red-500 hover:text-red-400 transition-colors uppercase font-bold tracking-wider"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Kelola pengguna dan data sistem FitBook.</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-[#cdff00] text-black px-6 py-3 rounded-xl font-black uppercase tracking-tighter hover:bg-[#b8e600] transition-colors"
        >
          + Tambah Data
        </button>
      </div>

      {renderTable("Data Trainer", "trainer")}
      {renderTable("Data User", "user")}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#151515] border border-[#333] rounded-3xl p-8 w-full max-w-md relative">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">
              {editingItem ? "Edit Data" : "Tambah Data"}
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#cdff00] transition-colors"
                  placeholder="Masukkan nama..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#cdff00] transition-colors"
                  placeholder="Masukkan email..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Peran</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#cdff00] transition-colors appearance-none"
                  >
                    <option value="User">User</option>
                    <option value="Trainer">Trainer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#cdff00] transition-colors appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 border border-[#333] text-gray-400 px-4 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-[#222] hover:text-white transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#cdff00] text-black px-4 py-3 rounded-xl font-black uppercase tracking-tighter hover:bg-[#b8e600] transition-colors text-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
