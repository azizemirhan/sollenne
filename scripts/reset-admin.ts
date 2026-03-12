import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function hashPassword(p: string) {
  return crypto.createHash('sha256').update(p).digest('hex');
}

const correctHash = hashPassword('admin');
console.log('Expected hash for "admin":', correctHash);

let users: { id: string; username: string; password: string; role: string; createdAt?: string }[] = [];
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const admin = users.find((u) => u.username === 'admin');
  if (admin) {
    console.log('Current admin hash:', admin.password);
    admin.password = correctHash;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    console.log('Admin password reset to "admin".');
  } else {
    users.push({
      id: '1',
      username: 'admin',
      password: correctHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    console.log('Admin user created with password "admin".');
  }
} else {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  users = [{
    id: '1',
    username: 'admin',
    password: correctHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  }];
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  console.log('users.json created. Admin: admin / admin');
}
