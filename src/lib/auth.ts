import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export interface User {
  id: string;
  username: string;
  password?: string; // Hashed password
  role: 'admin' | 'user';
  createdAt: string;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to hash password
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Read users from file
export function getUsers(): User[] {
  if (!fs.existsSync(USERS_FILE)) {
    // Initialize with default admin if not exists
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

  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Save users to file
export function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving users file:', error);
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
