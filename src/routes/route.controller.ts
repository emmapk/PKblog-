import express, { Router } from "express";
import { 
    getAuth, 
    register, 
    login, 
    verifyEmail, 
    updateUser 
} from "../controller/controller.authentication";

const router: Router = express.Router();

router.get("/register", getAuth);
router.post("/register", register);

router.get("/login", login);
router.post("/login", login);

router.get("/verify-email/:verificationToken", verifyEmail);

router.get("/update", register); 
router.put("/update/:userId", updateUser); 

router.get('/auth/confirmation/:token', verifyEmail);

export default router;
