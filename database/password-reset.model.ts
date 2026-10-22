import { Schema, model, models } from "mongoose";

const PasswordResetSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true  },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
});

//MongoDB deletes expired documents automatically
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = models.PasswordReset || model("PasswordReset", PasswordResetSchema);
export default PasswordReset;