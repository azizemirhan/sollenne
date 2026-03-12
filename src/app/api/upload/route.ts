import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Helper to check if file is CSV
const isCsv = (file: File) => file.name.endsWith(".csv") || file.type === "text/csv";

// Helper to sanitize filename
function sanitizeFilename(name: string): string {
    const replacements: { [key: string]: string } = {
        'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
        'İ': 'I', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'Ö': 'O', 'Ç': 'C',
        ' ': '_'
    };

    // Replace characters
    let sanitized = name.split('').map(char => replacements[char] || char).join('');

    // Remove invalid characters, allow alphanumerics, dots, underscores, dashes
    sanitized = sanitized.replace(/[^a-zA-Z0-9.\-_]/g, '');

    return sanitized;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];
        const period = formData.get("period") as string | null;

        if (!files || files.length === 0 || !period) {
            return NextResponse.json(
                { error: "Dosya ve dönem bilgisi gereklidir." },
                { status: 400 }
            );
        }

        // Validate period format (YYYY-MM)
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return NextResponse.json(
                { error: "Geçersiz dönem formatı. YYYY-MM olmalı." },
                { status: 400 }
            );
        }

        // Create directory path: veriler/YYYY-MM/
        const uploadDir = path.join(process.cwd(), "veriler", period);
        await mkdir(uploadDir, { recursive: true });

        let successCount = 0;
        const errors: string[] = [];

        for (const file of files) {
            if (!isCsv(file)) {
                errors.push(`${file.name}: Sadece CSV dosyaları yüklenebilir.`);
                continue;
            }

            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const safeName = sanitizeFilename(file.name);
                const filePath = path.join(uploadDir, safeName);
                await writeFile(filePath, buffer);
                successCount++;
            } catch (err) {
                console.error(`Error saving ${file.name}:`, err);
                errors.push(`${file.name}: Kaydetme hatası.`);
            }
        }

        if (successCount === 0 && errors.length > 0) {
            return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Dosya yükleme hatası." },
            { status: 500 }
        );
    }
}
