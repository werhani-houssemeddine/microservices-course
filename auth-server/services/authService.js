const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '1h';

class AuthService {

    static async validateToken(token) {
        try {
            const decoded = jwt.decode(token, JWT_SECRET);
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    static generateToken(user) {
        return "Bearer " + jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );
    }

    static async createAdmin({ username, email, password }) {
        try {
            // Validate input
            if (!username || !email || !password) {
                throw new Error('All fields are required');
            }

            const existingAdmin = await db.findAdminByUsernameOrEmail(username, email);
            if (existingAdmin) {
                throw new Error('An admin with this username or email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newAdmin = {
                username,
                email,
                role: 'admin',
                password: hashedPassword
            };

            const result = await db.createUser(newAdmin);
            const token = AuthService.generateToken({ id: result.id, role: 'admin' });

            return {
                token,
                role: 'admin'
            };
        } catch (error) {
            console.error('Admin creation error:', error);
            throw error;
        }
    }

    static async login({ email, password }) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const user = await db.findByEmail(email);
            if (!user) {
                throw new Error('Invalid credentials');
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }

            const token = AuthService.generateToken(user);

            return {
                token,
                role: user.role
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async getUsersByIds(ids) {
        const users = await db.findByIds(ids);
        return users.map(user => ({ email: user.email, username: user.username, role: user.role, id: user.id }));
    }

    static async register({ username, email, password }) {
        try {
            if (!username || !email || !password) {
                throw new Error('All fields are required');
            }

            // Check if user already exists
            const existingUser = await db.findByEmail(email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const newUser = {
                username,
                email,
                role: 'client',
                password: hashedPassword
            };

            const result = await db.createUser(newUser);
            const token = AuthService.generateToken({ id: result.id, role: 'client' });

            return {
                token,
                role: 'client'
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
}

module.exports = AuthService; 