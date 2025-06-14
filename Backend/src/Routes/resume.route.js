import { Router } from "express";
import { verifyJWT } from "../Middleware/auth.js";
import { AnalyzeResume, checkResume, createResume, deleteResume,  generateResumePdf, getAllResumes, getResumesId, saveResumeData } from "../Controllers/resume.controller.js";
import { upload } from "../Middleware/multer.js";

const router = Router()

router.route("/save").post(verifyJWT,saveResumeData)
router.route("/create").post(verifyJWT,createResume)
router.route("/:id").get(verifyJWT,getResumesId)
router.route("/").get(verifyJWT,getAllResumes)
router.route("/:id").delete(verifyJWT,deleteResume)
router.route("/generate").post(generateResumePdf)
router.route("/ats/check").post(upload.single('resume'),checkResume);
// router.route("/userProfiles").post(upload.single('resume'),AnalyzeResume);
// router.route("/userProfiles/").get(verifyJWT,getAllProfiles);
// router.route("/userProfiles/:id").get(verifyJWT, getAllProfilesId);
// router.route("/generate-dsa-questions").post(generateDsaQuestions)
// router.route("/evaluate-dsa").post(evaluateDsaCode)
// router.route("/generate-technical-questions").post(generateTechnicalQuestions);
// router.route("/evaluate-technical-answer").post(evaluateTechnicalAnswer);
// router.route("/generate-project-questions").post(generateProjectQuestions);
// router.route("/evaluate-project-answer").post(evaluateProjectAnswer);


export default router