import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    salary: {
        type: Number,
        required: true
    },
    experienceLevel:{
        type:Number,
        required:true,
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFlagged: {
        type: Boolean,
        default: false
    },
    flagReason: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'Engineering'
    }
},{timestamps:true});

jobSchema.index({ status: 1, isActive: 1 });
jobSchema.index({ title: 'text', description: 'text', location: 'text' });

export const Job = mongoose.model("Job", jobSchema);