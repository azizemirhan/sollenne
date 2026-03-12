import { NextResponse } from 'next/server';
import { verifyCredentials, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const u = String(username || '').trim();
        const p = String(password || '').trim();

        if (!u || !p) {
            return NextResponse.json(
                { error: 'Kullanıcı adı ve şifre gereklidir.' },
                { status: 400 }
            );
        }

        const user = verifyCredentials(u, p);

        if (user) {
            // In a real app, we would set a secure HTTP-only cookie here.
            // For this simple implementation, we'll return a success status
            // and let the client handle session state (e.g. via sessionStorage as before).
            // Ideally, we should sign a JWT.

            // Let's create a simple session object to return
            return NextResponse.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        }

        return NextResponse.json(
            { error: 'Kullanıcı adı veya şifre hatalı.' },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        );
    }
}
