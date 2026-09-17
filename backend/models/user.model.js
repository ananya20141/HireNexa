import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['student','recruiter','admin'],
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    savedJobs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job'
    }],
    profile:{
        bio:{type:String, default:""},
        skills:[{type:String}],
        experienceYears:{type:Number, default:0},
        education:[{
            degree:{type:String},
            institution:{type:String},
            year:{type:String}
        }],
        resume:{type:String, default:""}, // URL to resume file
        resumeOriginalName:{type:String, default:""},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, 
        profilePhoto:{
            type:String,
            default:""
        },
        firstJobMode:{
            type:Boolean,
            default:false
        },
        githubUrl:{
            type:String,
            default:""
        },
        projects:[{
            title:{type:String},
            description:{type:String},
            link:{type:String}
        }],
        certifications:[{
            name:{type:String},
            issuer:{type:String},
            year:{type:String}
        }],
        roadmapProgress:[{
            jobId:{type:mongoose.Schema.Types.ObjectId, ref:'Job'},
            completedPhases:[{type:Number}]
        }]
    },
},{timestamps:true});
export const User = mongoose.model('User', userSchema);