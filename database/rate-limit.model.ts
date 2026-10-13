import {Schema, model, models} from "mongoose";

const rateLimitSchema = new Schema({
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    expires: { type: Date, required: true },
});

//MongoDB deletes each document automatically once expireAt has passed
rateLimitSchema.index({ expiresAt: 1 }, {expireAfterSeconds: 0 });

const RateLimit = models.RateLimit || model("RateLimit", rateLimitSchema);
export default RateLimit;
