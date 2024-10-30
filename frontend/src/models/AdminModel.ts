import mongoose, { Document, Model, Schema } from 'mongoose';

enum role {
  SuperAdmin = "superadmin",
  Admin = "admin",
  Homeroom = "homeroom",
  User = "user",
}

interface IAdmin extends Document {
  name: string;
  username: string;
  password: string;
  role: role[];
  createdAt?: Date;
  resetPasswordSecretAnswer: string;
  manage: string[];
  
}

const AdminSchema: Schema = new Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  resetPasswordSecretAnswer: { type: String, required: true },
  role: [{ type: String, enum: Object.values(role) }],
  manage: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
