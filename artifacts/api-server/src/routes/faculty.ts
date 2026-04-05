import { Router, type IRouter } from "express";
import { db, facultyTable, departmentsTable, feedbackTable } from "@workspace/db";
import { avg, count, eq } from "drizzle-orm";
import {
  ListFacultyQueryParams,
  CreateFacultyBody,
  GetFacultyParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/faculty", async (req, res): Promise<void> => {
  const params = ListFacultyQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const facultyList = await db
    .select({
      id: facultyTable.id,
      name: facultyTable.name,
      email: facultyTable.email,
      designation: facultyTable.designation,
      departmentId: facultyTable.departmentId,
      departmentName: departmentsTable.name,
    })
    .from(facultyTable)
    .leftJoin(departmentsTable, eq(facultyTable.departmentId, departmentsTable.id))
    .where(
      params.data.departmentId
        ? eq(facultyTable.departmentId, params.data.departmentId)
        : undefined
    )
    .orderBy(facultyTable.name);

  const result = await Promise.all(
    facultyList.map(async (f) => {
      const [avgResult] = await db
        .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
        .from(feedbackTable)
        .where(eq(feedbackTable.facultyId, f.id));

      return {
        ...f,
        avgRating: avgResult?.avg ? parseFloat(avgResult.avg) : null,
        totalFeedbackCount: Number(avgResult?.cnt ?? 0),
      };
    })
  );

  res.json(result);
});

router.post("/faculty", async (req, res): Promise<void> => {
  const parsed = CreateFacultyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [faculty] = await db.insert(facultyTable).values(parsed.data).returning();

  const [dept] = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.id, faculty.departmentId));

  res.status(201).json({
    ...faculty,
    departmentName: dept?.name,
    avgRating: null,
    totalFeedbackCount: 0,
  });
});

router.get("/faculty/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetFacultyParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [faculty] = await db
    .select({
      id: facultyTable.id,
      name: facultyTable.name,
      email: facultyTable.email,
      designation: facultyTable.designation,
      departmentId: facultyTable.departmentId,
      departmentName: departmentsTable.name,
    })
    .from(facultyTable)
    .leftJoin(departmentsTable, eq(facultyTable.departmentId, departmentsTable.id))
    .where(eq(facultyTable.id, params.data.id));

  if (!faculty) {
    res.status(404).json({ error: "Faculty not found" });
    return;
  }

  const [avgResult] = await db
    .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
    .from(feedbackTable)
    .where(eq(feedbackTable.facultyId, params.data.id));

  res.json({
    ...faculty,
    avgRating: avgResult?.avg ? parseFloat(avgResult.avg) : null,
    totalFeedbackCount: Number(avgResult?.cnt ?? 0),
  });
});

export default router;
