import mongoose from "mongoose";


const taskSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        
    },
    description:{
        type:String,
        default:'',

    },
    status:{
        type: String,
        enum: ['pending', 'in-progress', 'done'],
        default:'pending',
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
},
{
    timestamps: true,
})

const Task = mongoose.model("Task", taskSchema);
export default Task;
