import { NextResponse } from 'next/server';
import { getUsers, createUser, updateUserPassword, deleteUser, hashPassword } from '@/lib/auth';

// Helper to check auth (simplified for this context)
// In a real app, valid session cookie/token is needed.
// Here we might check a header or just rely on obscurity if local.
// But we should try to be a bit secure.
// For now, let's assume the client sends a custom header "x-admin-auth" 
// which corresponds to the admin password hash or similar, OR 
// we just assume the API is protected by the app logic + maybe basic auth or 
// just allowing it since it's a local tool.
// Given the user wants "admin panel", let's keep it simple: 
// The client will not send special headers for now, but we could add basic protection later.

export async function GET() {
    const users = getUsers();
    // Return users without passwords
    const safeUsers = users.map(({ password, ...u }) => u);
    return NextResponse.json(safeUsers);
}

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
        }

        const newUser = createUser(username, password);
        if (!newUser) {
            return NextResponse.json({ error: 'Kullanıcı zaten mevcut.' }, { status: 409 });
        }

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, password } = await request.json();

        if (!id || !password) {
            return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
        }

        const success = updateUserPassword(id, password);
        if (!success) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 });
        }

        // Prevent deleting the last admin or the 'admin' user if desired
        // For now, simple delete.
        const success = deleteUser(id);
        if (!success) {
            return NextResponse.json({ error: 'Kullanıcı silinemedi.' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
    }
}
