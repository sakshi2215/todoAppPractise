import {changeCurrentPassword,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken
} from "../controllers/user.controllers.js"

import { Router } from "express"
import  verifyJWT  from "../middleware/auth.middleware.js"

const router = Router();

router.route("/register").post( registerUser);
router.route("/login").post( loginUser);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/logout").post( verifyJWT, logoutUser);
router.route("/changePassword").post( verifyJWT, changeCurrentPassword);


export default router;