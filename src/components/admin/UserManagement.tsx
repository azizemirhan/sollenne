"use client";

import { useState, useEffect } from "react";
import { User, Trash2, Key, Plus, RefreshCw } from "lucide-react";

interface UserData {
    id: string;
    username: string;
    role: string;
    createdAt: string;
}

export function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // New User Form State
    const [newUser, setNewUser] = useState("");
    const [newPass, setNewPass] = useState("");

    // Change Password State
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [changePass, setChangePass] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser || !newPass) return;

        try {
            const res = await fetch("/api/auth/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: newUser, password: newPass }),
            });

            if (res.ok) {
                setMessage("Kullanıcı oluşturuldu.");
                setNewUser("");
                setNewPass("");
                fetchUsers();
            } else {
                const data = await res.json();
                setMessage(`Hata: ${data.error}`);
            }
        } catch (err) {
            setMessage("Kayıt başarısız.");
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !changePass) return;

        try {
            const res = await fetch("/api/auth/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedUser, password: changePass }),
            });

            if (res.ok) {
                setMessage("Şifre güncellendi.");
                setChangePass("");
                setSelectedUser(null);
            } else {
                const data = await res.json();
                setMessage(`Hata: ${data.error}`);
            }
        } catch (err) {
            setMessage("Güncelleme başarısız.");
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/auth/users?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setMessage("Kullanıcı silindi.");
                fetchUsers();
            } else {
                const data = await res.json();
                setMessage(`Hata: ${data.error}`);
            }
        } catch (err) {
            setMessage("Silme başarısız.");
        }
    };

    return (
        <div style={{ padding: 20, background: "#fff", borderRadius: 8, border: "1px solid #E5E0D8", marginTop: 24 }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, color: "#2D2A26", display: "flex", alignItems: "center", gap: 10 }}>
                <User size={20} />
                Kullanıcı Yönetimi
            </h3>

            {message && (
                <div style={{ padding: 10, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 4, marginBottom: 15, color: "#0369a1", fontSize: 14 }}>
                    {message}
                    <button onClick={() => setMessage("")} style={{ float: "right", border: "none", background: "none", cursor: "pointer" }}>✕</button>
                </div>
            )}

            {/* User List */}
            <div style={{ marginBottom: 30 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <h4 style={{ margin: 0, fontSize: 14, color: "#6B6560" }}>Kayıtlı Kullanıcılar</h4>
                    <button onClick={fetchUsers} disabled={loading} style={{ border: "none", background: "none", cursor: "pointer", color: "#6B6560" }}>
                        <RefreshCw size={14} className={loading ? "spin" : ""} />
                    </button>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: "#F8F6F3" }}>
                            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #E5E0D8" }}>Kullanıcı</th>
                            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #E5E0D8" }}>Rol</th>
                            <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #E5E0D8" }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{u.username}</td>
                                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{u.role}</td>
                                <td style={{ padding: 8, borderBottom: "1px solid #eee", textAlign: "right", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                    <button
                                        onClick={() => { setSelectedUser(u.id); setChangePass(""); }}
                                        title="Şifre Değiştir"
                                        style={{ border: "1px solid #E5E0D8", background: "#fff", padding: 4, borderRadius: 4, cursor: "pointer", color: "#6B6560" }}
                                    >
                                        <Key size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        title="Sil"
                                        style={{ border: "1px solid #fee2e2", background: "#fef2f2", padding: 4, borderRadius: 4, cursor: "pointer", color: "#ef4444" }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && !loading && (
                            <tr><td colSpan={3} style={{ padding: 10, textAlign: "center", color: "#999" }}>Kullanıcı yok</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Create User Form */}
                <div>
                    <h4 style={{ fontSize: 14, color: "#6B6560", marginBottom: 10 }}>Yeni Kullanıcı Ekle</h4>
                    <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input
                            type="text"
                            placeholder="Kullanıcı Adı"
                            value={newUser}
                            onChange={(e) => setNewUser(e.target.value)}
                            style={{ padding: 8, borderRadius: 4, border: "1px solid #E5E0D8", fontSize: 13 }}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            style={{ padding: 8, borderRadius: 4, border: "1px solid #E5E0D8", fontSize: 13 }}
                            required
                        />
                        <button
                            type="submit"
                            style={{ padding: "8px 12px", background: "#AA5930", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                        >
                            <Plus size={14} /> Ekle
                        </button>
                    </form>
                </div>

                {/* Change Password Form */}
                <div>
                    <h4 style={{ fontSize: 14, color: "#6B6560", marginBottom: 10 }}>
                        {selectedUser ? `Şifre Değiştir: ${users.find(u => u.id === selectedUser)?.username}` : "Şifre Değiştir"}
                    </h4>
                    {selectedUser ? (
                        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <input
                                type="password"
                                placeholder="Yeni Şifre"
                                value={changePass}
                                onChange={(e) => setChangePass(e.target.value)}
                                style={{ padding: 8, borderRadius: 4, border: "1px solid #E5E0D8", fontSize: 13 }}
                                required
                            />
                            <div style={{ display: "flex", gap: 10 }}>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: "8px 12px", background: "#4b5563", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                                >
                                    Güncelle
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedUser(null); setChangePass(""); }}
                                    style={{ padding: "8px 12px", background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic", padding: 10, background: "#f9fafb", borderRadius: 4 }}>
                            Listeden bir kullanıcı seçin.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
