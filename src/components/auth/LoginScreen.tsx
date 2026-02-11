"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, User } from "lucide-react";

const AUTH_STORAGE_KEY = "sollenne_auth";

export function getStoredAuth(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setStoredAuth(valid: boolean): void {
  try {
    if (valid) sessionStorage.setItem(AUTH_STORAGE_KEY, "1");
    else sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch { /* ignore */ }
}

function checkCredentials(user: string, password: string): boolean {
  const envUser = process.env.NEXT_PUBLIC_AUTH_USER ?? "";
  const envPass = process.env.NEXT_PUBLIC_AUTH_PASSWORD ?? "";
  return envUser.length > 0 && user === envUser && password === envPass;
}

interface LoginScreenProps {
  onSuccess: () => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!user.trim() || !password) {
      setError("Kullanıcı adı ve şifre gerekli.");
      setLoading(false);
      return;
    }
    if (checkCredentials(user.trim(), password)) {
      setStoredAuth(true);
      onSuccess();
    } else {
      setError("Kullanıcı adı veya şifre hatalı.");
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F6F3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#FFFFFF",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid #E5E0D8",
          padding: 32,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Image
            src="/logo.png"
            alt="Solenne"
            width={140}
            height={44}
            style={{ objectFit: "contain" }}
          />
          <p style={{ margin: "12px 0 0", color: "#9B9590", fontSize: 14 }}>
            Satın alma analizi paneline giriş yapın
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label
              htmlFor="auth-user"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#6B6560",
                marginBottom: 6,
              }}
            >
              Kullanıcı adı
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={18}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9B9590",
                }}
              />
              <input
                id="auth-user"
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
                placeholder="Kullanıcı adı"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  borderRadius: 10,
                  border: "1px solid #E5E0D8",
                  background: "#FFFFFF",
                  fontSize: 14,
                  color: "#2D2A26",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="auth-password"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#6B6560",
                marginBottom: 6,
              }}
            >
              Şifre
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9B9590",
                }}
              />
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Şifre"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  borderRadius: 10,
                  border: "1px solid #E5E0D8",
                  background: "#FFFFFF",
                  fontSize: 14,
                  color: "#2D2A26",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          {error && (
            <p style={{ margin: 0, fontSize: 13, color: "#B54242", fontWeight: 500 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              background: "#AA5930",
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? "Kontrol ediliyor..." : "Giriş yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
