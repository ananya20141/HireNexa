import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:['applied', 'pending', 'under_review', 'shortlisted', 'assessment', 'interview', 'accepted', 'selected', 'rejected', 'hired'],
        default:'applied'
    },
    statusHistory:[{
        status:{ type: String },
        updatedAt:{ type: Date, default: Date.now }
    }],
    interviewDate:{
        type: Date
    },
    assessmentDate:{
        type: Date
    },
    reminderNote:{
        type: String,
        default: ""
    },
    withdrawn:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

applicationSchema.index({ job: 1, applicant: 1 });

export const Application = mongoose.model("Application", applicationSchema);