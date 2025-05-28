import {  createTask,
    deleteTask,
    updateTask,
    getAllTaskbyUser,
    getTaskById,
getTaskByStatus } from "../controllers/tasks.controllers.js"

import  verifyJWT  from "../middleware/auth.middleware.js"
import {Router} from "express";

const router = Router();
router.use(verifyJWT);
router.route("/status/:status").get(getTaskByStatus);
router.route("/postTask").post(createTask);
router.route("/").get(getAllTaskbyUser);
router.route("/:id").get(getTaskById);
router.route("/:id").put(updateTask);
router.route("/:id").delete(deleteTask);


export default router;

