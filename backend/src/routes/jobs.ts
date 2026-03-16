// Handles job related logic
import { Router, type Response } from "express";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/authMiddleware";
import prisma from "../db";
import { jobIdParamSchema, jobSchema, jobUpdateSchema } from "../types";

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
                id: newJob.id,
                jobID,
                cameraBrand: newJob.cameraBrand,
                cameraModel: newJob.cameraModel,
                serialNumber: newJob.serialNumber,
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
    // Update existing job (UUID received in params)
    try {
        const parsedParams = jobIdParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ message: "Invalid job id" });
        }

        const id = parsedParams.data.id;

        const parsedBody = jobUpdateSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ message: "Invalid inputs" });
        }

        const existing = await prisma.job.findUnique({
            where: { id },
            include: { customer: true }
        });

        if (!existing || !existing.isActive) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (!existing.customer || !existing.customer.isActive) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const updateData = parsedBody.data;

        /**
         * If serial number is being changed,
         * ensure no other active job exists for this camera.
         */
        if (updateData.serialNumber && updateData.serialNumber !== existing.serialNumber) {
            const conflict = await prisma.job.findFirst({
                where: {
                    id: { not: id },
                    customerId: existing.customerId,
                    serialNumber: updateData.serialNumber,
                    status: { not: "delivered" }
                }
            });

            if (conflict) {
                return res.status(409).json({
                    message: "Pending Job already exists on this camera"
                });
            }
        }

        const updated = await prisma.job.update({
            where: { id },
            data: updateData
        });

        const jobID = `JB${String(updated.jobNumber).padStart(6, "0")}`;

        return res.status(200).json({
            message: "Job updated successfully",
            job: {
                id: updated.id,
                jobID,
                cameraBrand: updated.cameraBrand,
                cameraModel: updated.cameraModel,
                serialNumber: updated.serialNumber,
                status: updated.status,
                accessories: updated.accessories,
                physicalCondition: updated.physicalCondition,
                notes: updated.notes,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt
            },
            customer: {
                id: existing.customer.id,
                name: existing.customer.name,
                phNo: existing.customer.phNo,
                address: existing.customer.address
            }
        });

    } catch (err) {
        console.error("Error while updating job:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Pending
jobsRouter.delete("/details/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    // Delete a particular job (deactivate)
    try {
        const parsedParams = jobIdParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ message: "Invalid job id" });
        }

        const id = parsedParams.data.id;
        const validJob = await prisma.job.findUnique({ where: { id } })

        if (!validJob || !validJob.isActive) {
            return res.status(404).json({ message: "Job not found" })
        }

        const deactivatedJob = await prisma.job.update({
            where: { id },
            data: { isActive: false }
        })

        const jobID = `JB${String(deactivatedJob.jobNumber).padStart(6, "0")}`;

        return res.status(201).json({
            message: "Job deleted successfully",
            job: {
                jobID,
                cameraBrand: deactivatedJob.cameraBrand,
                cameraModel: deactivatedJob.cameraModel,
                serialNumber: deactivatedJob.serialNumber
            }
        })

    } catch (err) {
        console.error(`Error while deleting job: ${err}`);
        return res.status(500).json({ message: "Internal server error" })
    }
})

export default jobsRouter;