import { NextResponse } from "next/server";
import { readdir, stat, rmdir, unlink, rm } from "fs/promises";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "veriler");

// Helper to get file structure
async function getFileStructure(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    const structure: any[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(DATA_DIR, fullPath).replace(/\\/g, "/");

        if (entry.isDirectory()) {
            const children = await getFileStructure(fullPath);
            structure.push({
                name: entry.name,
                path: relativePath,
                type: "folder",
                children
            });
        } else {
            const stats = await stat(fullPath);
            structure.push({
                name: entry.name,
                path: relativePath,
                type: "file",
                size: stats.size
            });
        }
    }

    // Sort: folders first, then files
    return structure.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "folder" ? -1 : 1;
    });
}

export async function GET() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            await fs.promises.mkdir(DATA_DIR, { recursive: true });
        }
        const structure = await getFileStructure(DATA_DIR);
        return NextResponse.json(structure);
    } catch (error) {
        console.error("Error listing files:", error);
        return NextResponse.json({ error: "Dosyalar listelenemedi" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const targetPath = searchParams.get("path");

        if (!targetPath) {
            return NextResponse.json({ error: "Path parametresi gerekli" }, { status: 400 });
        }

        // Security check: prevent directory traversal
        const fullPath = path.join(DATA_DIR, targetPath);
        if (!fullPath.startsWith(DATA_DIR)) {
            return NextResponse.json({ error: "Geçersiz yol" }, { status: 403 });
        }

        if (!fs.existsSync(fullPath)) {
            return NextResponse.json({ error: "Dosya veya klasör bulunamadı" }, { status: 404 });
        }

        const stats = await stat(fullPath);
        if (stats.isDirectory()) {
            // Recursive delete for folders
            await rm(fullPath, { recursive: true, force: true });
        } else {
            await unlink(fullPath);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ error: "Silme işlemi başarısız" }, { status: 500 });
    }
}
