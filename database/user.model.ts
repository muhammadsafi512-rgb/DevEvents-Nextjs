import { Schema, model, models, Document } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    googleId?: string;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                message: 'Please provide a valid email address',
            },
        },
        passwordHash: {
            type: String,
            select: false, // never returned by queries unless explicitly requested
        },
        role: {
            type: String,
            enum: { values: ['user', 'admin'], message: 'Role must be user or admin' },
            default: 'user',
        },
        googleId: { type: String, unique: true, sparse: true },
    },
    { timestamps: true }
);

const User = models.User || model<IUser>('User', UserSchema);

export default User;