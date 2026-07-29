import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import requestsRouter from "./requests";
import guestsRouter from "./guests";
import adminRouter from "./admin";
import userRouter from "./user";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(requestsRouter);
router.use(guestsRouter);
router.use(adminRouter);
router.use(userRouter);

export default router;
