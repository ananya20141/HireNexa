import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    actionType: {
        type: String,
        required: true,
        enum: [
            'USER_REGISTERED',
            'USER_LOGIN',
            'JOB_POSTED',
            'JOB_APPROVED',
            'JOB_REJECTED',
            'JOB_FLAGGED',
            'JOB_DELETED',
            'APPLICATION_SUBMITTED',
            'APPLICATION_STATUS_UPDATED',
            'APPLICATION_WITHDRAWN',
            'USER_BLOCKED',
            'USER_UNBLOCKED',
            'COMPANY_CREATED',
            'COMPANY_UPDATED'
        ]
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

activitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);
