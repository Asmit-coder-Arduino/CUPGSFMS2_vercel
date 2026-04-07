import { Router, type IRouter } from "express";
import healthRouter from "./health";
import departmentsRouter from "./departments";
import facultyRouter from "./faculty";
import coursesRouter from "./courses";
import feedbackRouter from "./feedback";
import windowsRouter from "./windows";
import analyticsRouter from "./analytics";
import authRouter from "./auth";
import formTemplatesRouter from "./formTemplates";
import complaintsRouter from "./complaints";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(departmentsRouter);
router.use(facultyRouter);
router.use(coursesRouter);
router.use(feedbackRouter);
router.use(windowsRouter);
router.use(analyticsRouter);
router.use(formTemplatesRouter);
router.use(complaintsRouter);

export default router;
