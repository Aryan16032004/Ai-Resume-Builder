import { Router } from "express";
import { verifyJWT } from "../Middleware/auth.js";
import { checkResume, createResume, deleteResume, generateResumePdf, getAllResumes, getResumesId, saveResumeData } from "../Controllers/resume.controller.js";
import { upload } from "../Middleware/multer.js";

const router = Router()

router.route("/save").post(verifyJWT,saveResumeData)
router.route("/create").post(verifyJWT,createResume)
router.route("/:id").get(verifyJWT,getResumesId)
router.route("/").get(verifyJWT,getAllResumes)
router.route("/:id").delete(verifyJWT,deleteResume)
router.route("/generate").post(generateResumePdf)
router.route("/ats/check").post(upload.single('resume'),checkResume);


export default router