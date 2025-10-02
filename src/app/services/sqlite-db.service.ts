import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

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
  providedIn: 'root',
})
export class SqliteDbService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private dbReadyResolver!: () => void;
  private dbReady = new Promise<void>(
    (resolve) => (this.dbReadyResolver = resolve)
  );

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.initDB();
  }

  // Inicialización de la base de datos
  private async initDB() {
    try {
      this.db = await this.sqlite.createConnection(
        'rescate_ya',
        false,
        'no-encryption',
        1,
        false
      );
      await this.db.open();

      // Tabla de usuarios
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

      // Tabla de contactos de emergencia con FK
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS emergency_contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          name TEXT,
          phone TEXT,
          FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      console.log('SQLite DB inicializada correctamente');
      this.dbReadyResolver();
    } catch (err) {
      console.error('Error inicializando DB:', err);
    }
  }

  private async ensureDbReady() {
    await this.dbReady;
    if (!this.db) throw new Error('Base de datos no inicializada');
  }

  // ------------------------ USUARIOS ------------------------
  async createUser(user: User): Promise<number> {
    await this.ensureDbReady();
    try {
      const res = await this.db.run(
        `INSERT INTO users (name, email, password, phone, address, medicalData)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user.name,
          user.email,
          user.password,
          user.phone,
          user.address,
          user.medicalData,
        ]
      );
      return res.changes?.lastId ?? 0;
    } catch (err: any) {
      console.error('Error creando usuario:', err);
      throw new Error('No se pudo registrar el usuario (correo ya registrado)');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureDbReady();
    const res = await this.db.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    return (res.values?.[0] as User) ?? null;
  }

  async getUserById(id: number): Promise<User | null> {
    await this.ensureDbReady();
    const res = await this.db.query(`SELECT * FROM users WHERE id = ?`, [id]);
    return (res.values?.[0] as User) ?? null;
  }

  async updateUser(id: number, user: User) {
    await this.ensureDbReady();
    await this.db.run(
      `UPDATE users SET name=?, email=?, password=?, phone=?, address=?, medicalData=? WHERE id=?`,
      [
        user.name,
        user.email,
        user.password,
        user.phone,
        user.address,
        user.medicalData,
        id,
      ]
    );
  }

  async deleteUser(id: number) {
    await this.ensureDbReady();
    await this.db.run(`DELETE FROM users WHERE id=?`, [id]);
    await this.db.run(`DELETE FROM emergency_contacts WHERE userId=?`, [id]);
  }

  // ----------------- CONTACTOS DE EMERGENCIA -----------------
  async getEmergencyContacts(userId: number): Promise<EmergencyContact[]> {
    await this.ensureDbReady();
    const res = await this.db.query(
      `SELECT * FROM emergency_contacts WHERE userId = ?`,
      [userId]
    );
    return res.values ? (res.values as EmergencyContact[]) : [];
  }

  async updateEmergencyContacts(
    userId: number,
    contacts: { name: string; phone: string }[]
  ) {
    await this.ensureDbReady();
    try {
      await this.db.execute('BEGIN TRANSACTION;');
      await this.db.run(`DELETE FROM emergency_contacts WHERE userId = ?`, [
        userId,
      ]);
      for (const c of contacts) {
        await this.db.run(
          `INSERT INTO emergency_contacts (userId, name, phone) VALUES (?, ?, ?)`,
          [userId, c.name, c.phone]
        );
      }
      await this.db.execute('COMMIT;');
    } catch (err) {
      await this.db.execute('ROLLBACK;');
      console.error('Error actualizando contactos:', err);
      throw err;
    }
  }

  // ------------------------ LOGIN ------------------------
  async validateLogin(email: string, password: string): Promise<User | null> {
    await this.ensureDbReady();
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  // ------------------------ UTIL ------------------------
  async closeConnection() {
    await this.ensureDbReady();
    await this.db.close();
    await this.sqlite.closeConnection('rescate_ya', false);
  }
}
