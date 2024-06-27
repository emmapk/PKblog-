import express, { Router } from "express";
import { 
    getAuth, 
    register, 
    login, 
    verifyEmail, 
    renderUpdateForm,
    updateUser 
} from "../controller/controller.authentication";
import upload from "../controller/upload";

const router: Router = express.Router();

router.get("/register", getAuth);
router.post("/register", upload.single('image'), register);

router.get("/login", login);
router.post("/login", login);

router.get("/verify-email/:verificationToken", verifyEmail);

router.get("/update/:userId", renderUpdateForm); 
router.post("/update/:userId", upload.single('image'), updateUser);

router.get('/auth/confirmation/:token', verifyEmail);

export default router;
