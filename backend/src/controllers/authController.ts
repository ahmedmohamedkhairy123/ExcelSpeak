import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import config from '../config/env';

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { email, password, name } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ error: 'Email, password and name are required' });
            }

            // Check if user exists
            const existingUser = await UserModel.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Create user
            const user = await UserModel.createUser(email, password, name);

            // Generate token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                config.sessionSecret,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                token
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Find user
            const user = await UserModel.findUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Validate password
            const isValid = await UserModel.validatePassword(user, password);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                config.sessionSecret,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                token
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async me(req: Request, res: Response) {
        try {
            // User is attached by auth middleware
            const user = (req as any).user;
            res.json({ success: true, user });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}