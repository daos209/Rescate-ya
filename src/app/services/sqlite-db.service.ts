import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  medicalData?: string;
}

export interface EmergencyContact {
  id?: number;
  userId: number;
  name: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class SqliteDbService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private dbReady: Promise<void>;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.dbReady = this.initDB();
  }

  private async initDB() {
    try {
      this.db = await this.sqlite.createConnection('rescate_ya', false, 'no-encryption', 1, false);
      await this.db.open();

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT UNIQUE,
          password TEXT,
          phone TEXT,
          address TEXT,
          medicalData TEXT
        );
      `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS emergency_contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          name TEXT,
          phone TEXT
        );
      `);

      console.log('SQLite DB inicializada correctamente');
    } catch (err) {
      console.error('Error inicializando DB:', err);
    }
  }

  private async ensureDbReady() {
    await this.dbReady;
  }

  async createUser(user: User): Promise<number> {
    await this.ensureDbReady();
    const res = await this.db.run(
      `INSERT INTO users (name, email, password, phone, address, medicalData)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.name, user.email, user.password, user.phone, user.address, user.medicalData]
    );
    return res.changes?.lastId ?? 0;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureDbReady();
    const res = await this.db.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (res.values && res.values.length > 0) return res.values[0] as User;
    return null;
  }

  async getUserById(id: number): Promise<User | null> {
    await this.ensureDbReady();
    const res = await this.db.query(`SELECT * FROM users WHERE id = ?`, [id]);
    if (res.values && res.values.length > 0) return res.values[0] as User;
    return null;
  }

  async updateUser(id: number, user: User) {
    await this.ensureDbReady();
    await this.db.run(
      `UPDATE users SET name=?, email=?, password=?, phone=?, address=?, medicalData=? WHERE id=?`,
      [user.name, user.email, user.password, user.phone, user.address, user.medicalData, id]
    );
  }

  async deleteUser(id: number) {
    await this.ensureDbReady();
    await this.db.run(`DELETE FROM users WHERE id=?`, [id]);
    await this.db.run(`DELETE FROM emergency_contacts WHERE userId=?`, [id]);
  }
  async getEmergencyContacts(userId: number): Promise<EmergencyContact[]> {
    await this.ensureDbReady();
    const res = await this.db.query(`SELECT * FROM emergency_contacts WHERE userId = ?`, [userId]);
    return res.values ? (res.values as EmergencyContact[]) : [];
  }

  async updateEmergencyContacts(userId: number, contacts: {name: string, phone: string}[]) {
    await this.ensureDbReady();
    await this.db.run(`DELETE FROM emergency_contacts WHERE userId = ?`, [userId]);

    for (const c of contacts) {
      await this.db.run(
        `INSERT INTO emergency_contacts (userId, name, phone) VALUES (?, ?, ?)`,
        [userId, c.name, c.phone]
      );
    }
  }

  async validateLogin(email: string, password: string): Promise<User | null> {
    await this.ensureDbReady();
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) return user;
    return null;
  }

  async closeConnection() {
    await this.ensureDbReady();
    await this.db.close();
  }
}
