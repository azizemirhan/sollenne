import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  username: string;
  password?: string; // Hashed password
  role: 'admin' | 'user';
  createdAt: string;
}

// Fallback for Cloudflare Workers (no filesystem) - SHA256 of "admin"
const FALLBACK_ADMIN_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
const FALLBACK_USERS: User[] = [
  { id: '1', username: 'admin', password: FALLBACK_ADMIN_HASH, role: 'admin', createdAt: '2026-01-01T00:00:00.000Z' },
];

// Helper to hash password
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getUsersFilePath(): string | null {
  try {
    return path.join(process.cwd(), 'data', 'users.json');
  } catch {
    return null;
  }
}

// Read users from file; on Workers (no fs) fallback to default admin
export function getUsers(): User[] {
  const USERS_FILE = getUsersFilePath();
  if (!USERS_FILE) return FALLBACK_USERS;

  try {
    if (!fs.existsSync(path.dirname(USERS_FILE))) return FALLBACK_USERS;
    if (!fs.existsSync(USERS_FILE)) {
      const defaultUser: User = {
        id: '1',
        username: 'admin',
        password: hashPassword('admin'),
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      saveUsers([defaultUser]);
      return [defaultUser];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(data);
    return Array.isArray(users) && users.length > 0 ? users : FALLBACK_USERS;
  } catch {
    return FALLBACK_USERS;
  }
}

// Save users to file (no-op on Workers)
export function saveUsers(users: User[]): void {
  const USERS_FILE = getUsersFilePath();
  if (!USERS_FILE) return;
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch {
    // Expected on Cloudflare Workers (read-only fs)
  }
}

// Find user by username
export function findUserByUsername(username: string): User | undefined {
  const users = getUsers();
  return users.find((u) => u.username === username);
}

// Verify credentials
export function verifyCredentials(username: string, password: string): User | null {
  const user = findUserByUsername(username);
  if (!user || !user.password) return null;

  const hashed = hashPassword(password);
  if (hashed === user.password) {
    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

// Create new user
export function createUser(username: string, password: string): User | null {
  const users = getUsers();
  if (users.find((u) => u.username === username)) {
    return null; // User already exists
  }

  const newUser: User = {
    id: Date.now().toString(),
    username,
    password: hashPassword(password),
    role: 'user', // Default role
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

// Update user password
export function updateUserPassword(id: string, newPassword: string): boolean {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;

  users[index].password = hashPassword(newPassword);
  saveUsers(users);
  return true;
}

// Delete user
export function deleteUser(id: string): boolean {
  let users = getUsers();
  const initialLength = users.length;
  users = users.filter((u) => u.id !== id);
  
  if (users.length === initialLength) return false;
  
  saveUsers(users);
  return true;
}
