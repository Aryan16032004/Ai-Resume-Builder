import { Router } from "express";
import { verifyJWT } from "../Middleware/auth.js";
import { AnalyzeResume,  deleteProfile,  evaluateDsaCode, evaluateProjectAnswer, evaluateTechnicalAnswer, generateDsaQuestions, generateProjectQuestions, generateResumePdf, generateTechnicalQuestions, getAllProfiles, getAllProfilesId,  } from "../Controllers/resume.controller.js";
import { upload } from "../Middleware/multer.js";

const router = Router()


router.route("/userProfiles").post(upload.single('resume'),AnalyzeResume);
router.route("/").get(verifyJWT,getAllProfiles);
router.route("/:id").get(verifyJWT, getAllProfilesId);
router.route("/:id").delete(deleteProfile)
router.route("/generate-dsa-questions").post(generateDsaQuestions)
router.route("/evaluate-dsa").post(evaluateDsaCode)
router.route("/generate-technical-questions").post(generateTechnicalQuestions);
router.route("/evaluate-technical-answer").post(evaluateTechnicalAnswer);
router.route("/generate-project-questions").post(generateProjectQuestions);
router.route("/evaluate-project-answer").post(evaluateProjectAnswer);


export default router