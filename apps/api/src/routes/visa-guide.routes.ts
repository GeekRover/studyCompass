import { Router, type Response } from "express";
import { visaGuideCreateSchema } from "@study-abroad/shared";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  VisaGuideError,
  createVisaGuide,
  getVisaGuideForCountry
} from "../services/visa-guide.service.js";

/**
 * Module 4 · Feature 3 — Visa Preparation Hub
 *
 *   GET  /api/visa-guide/country/:countryId   Read published guidance
 *                                             (managers/admins also see drafts)
 *   POST /api/visa-guide                      Create guidance entry
 *                                             (CONTENT_MANAGER / ADMIN)
 */
export const visaGuideRouter = Router();

visaGuideRouter.use(requireAuth);

visaGuideRouter.get("/country/:countryId", async (req, res) => {
  const includeUnpublished =
    req.user!.role === "ADMIN" || req.user!.role === "CONTENT_MANAGER";

  try {
    const result = await getVisaGuideForCountry(req.params.countryId, {
      includeUnpublished
    });
    return res.json(result);
  } catch (error) {
    return handleVisaGuideError(error, res);
  }
});

visaGuideRouter.post(
  "/",
  requireRole(["CONTENT_MANAGER", "ADMIN"]),
  async (req, res) => {
    const parsed = visaGuideCreateSchema.safeParse(req.body ?? {});

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid visa guide payload",
        errors: parsed.error.flatten().fieldErrors
      });
    }

    try {
      const visaGuide = await createVisaGuide(parsed.data);
      return res.status(201).json({ visaGuide });
    } catch (error) {
      return handleVisaGuideError(error, res);
    }
  }
);

function handleVisaGuideError(error: unknown, res: Response) {
  if (error instanceof VisaGuideError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errors: error.details
    });
  }

  throw error;
}
