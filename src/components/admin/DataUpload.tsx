"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, RefreshCw, Trash2, Folder, File, ChevronRight, ChevronDown } from "lucide-react";

interface FileNode {
    name: string;
    path: string;
    type: "folder" | "file";
    size?: number;
    children?: FileNode[];
}

export function DataUpload() {
    const [period, setPeriod] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

    // Initialize period
    useEffect(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        setPeriod(`${y}-${m}`);
    }, []);

    const fetchFiles = useCallback(async () => {
        try {
            const res = await fetch("/api/files");
            if (res.ok) {
                const data = await res.json();
                setFileStructure(data);
                // Auto expand all folders initially
                const expand: Record<string, boolean> = {};
                const traverse = (nodes: FileNode[]) => {
                    nodes.forEach(node => {
                        if (node.type === "folder") {
                            expand[node.path] = true;
                            if (node.children) traverse(node.children);
                        }
                    });
                };
                traverse(data);
                setExpandedFolders(prev => Object.keys(prev).length === 0 ? expand : prev);
            }
        } catch (error) {
            console.error("Failed to fetch files", error);
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files || files.length === 0 || !period) {
            setMessage({ type: "error", text: "Lütfen en az bir dosya ve dönem seçin." });
            return;
        }

        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("period", period);
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: `${data.count} dosya başarıyla yüklendi!` });
                setFiles(null);
                const fileInput = document.getElementById("csv-upload") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
                fetchFiles(); // Refresh list
            } else {
                setMessage({ type: "error", text: data.error || "Yükleme başarısız." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Bir hata oluştu." });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (path: string, type: "file" | "folder") => {
        if (!confirm(`${type === "folder" ? "Klasörü ve içindeki tüm dosyaları" : "Dosyayı"} silmek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchFiles();
                if (type === "folder" && period === path) {
                    // Optional: reset period if deleted? Maybe not needed.
                }
            } else {
                alert("Silme işlemi başarısız.");
            }
        } catch (error) {
            alert("Bir hata oluştu.");
        }
    };

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const renderTree = (nodes: FileNode[]) => {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {nodes.map((node) => (
                    <div key={node.path} style={{ paddingLeft: node.type === "file" ? 20 : 0 }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 8px",
                            borderRadius: 6,
                            background: "#F8F6F3",
                            fontSize: 13
                        }}>
                            {node.type === "folder" && (
                                <button
                                    onClick={() => toggleFolder(node.path)}
                                    style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: "#6B6560" }}
                                >
                                    {expandedFolders[node.path] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                            )}

                            {node.type === "folder" ? <Folder size={14} color="#AA5930" /> : <FileText size={14} color="#6B6560" />}

                            <span style={{ flex: 1, fontWeight: node.type === "folder" ? 600 : 400, color: "#2D2A26" }}>
                                {node.name}
                            </span>

                            {node.type === "file" && node.size && (
                                <span style={{ fontSize: 11, color: "#9B9590" }}>
                                    {(node.size / 1024).toFixed(1)} KB
                                </span>
                            )}

                            <button
                                onClick={() => handleDelete(node.path, node.type)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    padding: 4,
                                    cursor: "pointer",
                                    color: "#B54242",
                                    opacity: 0.6,
                                    transition: "opacity 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
                                title="Sil"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {node.type === "folder" && expandedFolders[node.path] && node.children && (
                            <div style={{ marginLeft: 12, marginTop: 4, paddingLeft: 8, borderLeft: "1px solid #E5E0D8" }}>
                                {renderTree(node.children)}
                            </div>
                        )}
                    </div>
                ))}
                {nodes.length === 0 && <div style={{ fontSize: 13, color: "#9B9590", padding: 8 }}>Klasör boş</div>}
            </div>
        );
    };

    return (
        <div style={{ padding: 24, background: "#fff", borderRadius: 16, border: "1px solid #E5E0D8", marginTop: 24 }}>
            <h3 style={{ marginTop: 0, marginBottom: 24, color: "#2D2A26", display: "flex", alignItems: "center", gap: 10 }}>
                <Upload size={20} />
                Veri Yükleme ve Yönetimi
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
                {/* Left: Upload Form */}
                <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#2D2A26", marginBottom: 16 }}>Yeni Veri Yükle</h4>
                    <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Period Selection */}
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6B6560", marginBottom: 8 }}>
                                Dönem (Yıl-Ay)
                            </label>
                            <input
                                type="month"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: "1px solid #E5E0D8",
                                    fontSize: 14,
                                    color: "#2D2A26",
                                    outline: "none",
                                    background: "#f9fafb",
                                }}
                            />
                            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9B9590" }}>
                                Dosyanın yükleneceği klasör: <code>veriler/{period}/</code>
                            </p>
                        </div>

                        {/* File Selection */}
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6B6560", marginBottom: 8 }}>
                                CSV Dosyaları
                            </label>
                            <div
                                style={{
                                    border: "2px dashed #E5E0D8",
                                    borderRadius: 8,
                                    padding: 24,
                                    textAlign: "center",
                                    background: "#f9fafb",
                                    cursor: "pointer",
                                    transition: "border-color 0.2s",
                                }}
                                onClick={() => document.getElementById("csv-upload")?.click()}
                            >
                                <input
                                    id="csv-upload"
                                    type="file"
                                    accept=".csv"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                                <FileText size={32} color="#9B9590" style={{ marginBottom: 12 }} />
                                <div style={{ fontSize: 14, color: "#6B6560", fontWeight: 500 }}>
                                    {files && files.length > 0 ? `${files.length} dosya seçildi` : "Dosya seçmek için tıklayın veya sürükleyin"}
                                </div>
                                <div style={{ fontSize: 12, color: "#9B9590", marginTop: 4 }}>
                                    Toplu yükleme yapılabilir (.csv)
                                </div>
                            </div>
                        </div>

                        {/* Message Area */}
                        {message && (
                            <div
                                style={{
                                    padding: "12px 16px",
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
                                    color: message.type === "success" ? "#047857" : "#b91c1c",
                                    border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                                }}
                            >
                                {message.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                {message.text}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !files || files.length === 0 || !period}
                            style={{
                                padding: "12px 24px",
                                background: loading || !files ? "#E5E7EB" : "#AA5930",
                                color: loading || !files ? "#9CA3AF" : "#FFFFFF",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: loading || !files ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                marginTop: 10,
                            }}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={18} className="spin" /> Yükleniyor...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} /> Yükle
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right: File Manager */}
                <div style={{ borderLeft: "1px solid #E5E0D8", paddingLeft: 40 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "#2D2A26", margin: 0 }}>Mevcut Dosyalar</h4>
                        <button
                            onClick={fetchFiles}
                            title="Yenile"
                            style={{ border: "none", background: "none", cursor: "pointer", color: "#6B6560" }}
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <div style={{
                        maxHeight: 400,
                        overflowY: "auto",
                        paddingRight: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8
                    }}>
                        {fileStructure.length === 0 ? (
                            <div style={{ fontSize: 13, color: "#9B9590", fontStyle: "italic" }}>
                                {loading ? "Yükleniyor..." : "Henüz dosya yok."}
                            </div>
                        ) : (
                            renderTree(fileStructure)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
