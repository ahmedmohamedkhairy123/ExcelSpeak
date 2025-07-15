import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/env';
import Database from './Database';

const db = Database.getInstance();

export class UserModel {
    static async createUser(email: string, password: string, name: string) {
        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);

        await (await db.getDb()).run(
            `INSERT INTO users (id, email, password_hash, name, created_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [id, email, hashedPassword, name]
        );

        return { id, email, name };
    }

    static async findUserByEmail(email: string) {
        const row = await (await db.getDb()).get(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return row;
    }

    static async validatePassword(user: any, password: string) {
        return await bcrypt.compare(password, user.password_hash);
    }
}