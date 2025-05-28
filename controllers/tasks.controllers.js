import Task from "../models/tasks.models.js"
import  { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.utils.js";
import APIResponse from "../utils/apiResponse.utils.js";
import ApiError from "../utils/apiError.utils.js"
import User from "../models/user.models.js";


const createTask = asyncHandler(async(req, res)=>{
    const {title, description} = req.body;

    if(!title?.trim) throw new ApiError(400, "Title cannot be empty");

    const createdBy = req.user._id;
    if(!createdBy) throw new ApiError(400, "LogIn before creating the Task");
    
    const newTask = await Task.create({
        title,
        description,
        createdBy,
    }).select("title description createdBy status")

    if(!newTask) throw new ApiError(500, "Something went wrong");

    return res
    .status(201)
    .json(
        new APIResponse(201, newTask, "SuccessFully created the task")
    )


})


const getAllTaskbyUser = asyncHandler(async(req, res)=>{

    const user = req.user?._id;

    if(!user) throw new ApiError(400, "No user Found");

    const tasks = await Task.find({
        createdBy: user,
    }).select("title description status")

    if(!tasks) throw new ApiError(400, "No record Found");

    res
    .status(200)
    .json(
        new APIResponse(200, tasks, "SuccessFully fetched the task")
    )

})


const getTaskById = asyncHandler(async(req, res)=>{

    const taskId = req.params.id;

    if(!isValidObjectId(taskId)) throw new ApiError(500, "Id is not valid");

    const task = await Task.findById(taskId).select("title description createdBy status");

    if(!task) throw new ApiError(404, "Task does not exists");

    if(task.createdBy.toString() != req.user._id.toString()){
        throw new ApiError(403, "User is not authorized to view Tasks")
    }

    res
    .status(200)
    .json(
        new APIResponse(
            200, task, "Successfully fetched the data"
        )
    )
})


const deleteTask = asyncHandler(async(req, res)=>{

    const taskId = req.params.id;

    if(!taskId || !isValidObjectId(taskId)) throw new ApiError(404, "Invalid Task Id");

     const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");

    if(task.createdBy.toString() != req.user._id.toString()){
        throw new ApiError(403, "User is not authorized to view Tasks")
    }

    await task.deleteOne();

    res
    .status(200)
    .json(
        new APIResponse(
            200, {}, "Sucessfully deleted the Task"
        )
    )


})


const updateTask = asyncHandler(async(req, res)=>{

    const taskId = req.params.id;

    if(!taskId || !isValidObjectId(taskId)) throw new ApiError(404, "Invalid Task Id");

    const task = await Task.findById(taskId);

    if (!task) throw new ApiError(404, "Task not found");

    if(task.createdBy.toString() != req.user._id.toString()){
        throw new ApiError(403, "User is not authorized to view Tasks")
    }
    
    const {title, description, status} = req.body;
    // Optional: Validate status
    const allowedStatus = ["pending", "in-progress", "done"];

    if (status && !allowedStatus.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  if (title) task.title = title;
  if (description) task.description = description;
  if (status) task.status = status;

  await task.save();

  const responseData = {
  title: task.title,
  description: task.description,
  status: task.status,
};

  res.status(200).json(new APIResponse(200,  responseData, "Task updated successfully"));

})

const getTaskByStatus = asyncHandler(async(req, res)=>{
    const status = req.params.status;
    const userID = req.user._id;

    if(!isValidObjectId(userID)) throw new ApiError(404, "Invalid user ID");

    // if(!status || status?.trim().length()==0) throw new ApiError(404, "Status cannot be empty");
    const VALID_STATUSES = ["pending", "in-progress", "completed"];
    if (!VALID_STATUSES.includes(status.trim())) {
        throw new ApiError(400, "Invalid status type");
    }
    const user = await User.findById(userID).select("_id");

    if(!user) throw new ApiError(404, "Cannot find the user");

    const taskByUser = await Task.find({
        createdBy: user,
        status: status.trim().toLowerCase(),
    });

    if(!taskByUser) throw new ApiError(404, "No task found");

    res.status(200)
    .json(
        new APIResponse(
            200, 
            {count: taskByUser.length, data: taskByUser},
            "Success",
        )
    )

})
export {
    createTask,
    deleteTask,
    updateTask,
    getAllTaskbyUser,
    getTaskById,
    getTaskByStatus
}