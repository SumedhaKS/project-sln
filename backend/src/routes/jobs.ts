// Handles job related logic
import { Router, type Response } from "express";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/authMiddleware";
import prisma from "../db";
import { jobSchema, type JobInput } from "../types";

const jobsRouter = Router();

/* 
    GET     /bulk               - Fetches all jobs (paginated + filter)
    GET     /details/:id        - Fetch a particular job
    POST    /details            - Create new job
    PUT     /details/:id        - Update existing job
    DELETE  /details/:id        - Delete a particular job (deactivate)
*/

jobsRouter.get("/bulk", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    // Fetches all jobs (paginated + filter)
})

jobsRouter.get("/details/:id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    // Fetch a particular job
})

/*
    {
        customerID,
        cameraBrand,
        cameraModel,
        serialNumber,
        accessories,
        physicalCondition,
        notes
    }
*/

jobsRouter.post("/details", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    // Create new job. (Main idea)----> One Camera = One Job. Can create multiple repairs on it
    try {
        const job = jobSchema.safeParse(req.body);
        if (!job.success) {
            return res.status(400).json({ message: "Invalid inputs" })
        }
        const { customerID, cameraBrand, cameraModel, serialNumber, accessories, physicalCondition, notes } = job.data;

        const [customer, existingJob] = await Promise.all([
            prisma.customer.findUnique({ where: { id: customerID } }),
            prisma.job.findFirst({ where: { customerId: customerID, serialNumber, status: { not: "delivered" } } })
        ])

        if (!customer || !customer.isActive) {
            return res.status(404).json({ message: "Customer not found" })
        }

        if (existingJob) {
            return res.status(409).json({ message: "Pending Job already exists on this camera" })
        }

        const newJob = await prisma.job.create({
            data: {
                customerId: customerID,
                cameraBrand,
                cameraModel,
                serialNumber,
                accessories,
                physicalCondition,
                notes
            }
        });
        const jobID = `JB${String(newJob.jobNumber).padStart(6, "0")}`;

        return res.status(201).json({
            message: "Job created successfully",
            job: {
                jobID,
                cameraBrand,
                cameraModel,
                serialNumber,
                status: newJob.status,
                createdAt: newJob.createdAt
            },
            customer: {
                id: customerID,
                name: customer.name,
                phNo: customer.phNo,
                address: customer.address
            }
        })
    }
    catch (err) {
        console.error(`Error while creating new job: ${err}`);
        return res.status(500).json({ message: "Internal server error" })
    }
})

jobsRouter.put("/details/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    // Update existing job
})

jobsRouter.delete("/details/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    // Delete a particular job (deactivate)
})

export default jobsRouter;