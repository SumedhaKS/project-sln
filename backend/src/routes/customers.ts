// Handles customer creation/handling related logic
import { Router, type Response } from "express";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/authMiddleware";
import { customerSchema, type Customer } from "../types";
import prisma from "../db";

const customerRouter = Router();

// GET   /customer/bulk                      - fetch all / some customers
// GET   /customer/details/:id               - get details of a particular customer 
// POST  /cutsomer/details                   - add new customer
// PUT   /customer/details/:id               - update existing customer

customerRouter.get("/bulk", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    // fetch details of all customers
    // Implement pagination here, we will send 15 records at once. frontend will also display 15/page. 
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(1, Math.min(Number(req.query.limit) || 15, 20));
        const skip = (page - 1) * limit;

        const [customers, totalCount] = await Promise.all([
            prisma.customer.findMany({
                where: { isActive: true },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    phNo: true,
                    address: true,
                    createdAt: true
                }
            }),
            prisma.customer.count({
                where: { isActive: true }
            })
        ])

        return res.status(200).json({
            message: "Customers fetched successfully",
            data: customers,
            pagination: {
                totalRecords: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                pageSize: limit,
                hasNextPage: ((page * limit) < totalCount)
            }
        })
    }
    catch (err) {
        console.error("Error while fetching customers: ", err);
        return res.status(500).json({ message: "Internal Server Error" })
    }

})

customerRouter.get("/details/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    // get the User's details with their Jobs in descending. (+ Payment history? in future)
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string") return res.status(400).json({ message: "Invalid request" });

        const customer = await prisma.customer.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                phNo: true,
                address: true,
                isActive: true,
                jobs: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                    select: {
                        jobNumber: true,
                        cameraBrand: true,
                        cameraModel: true,
                        serialNumber: true,
                        status: true,
                        accessories: true,
                        physicalCondition: true,
                        notes: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!customer || !customer.isActive) {
            return res.status(404).json({ message: "Customer not found" })
        }

        const jobs = customer.jobs.map((job) => ({
            jobID: `JB${String(job.jobNumber).padStart(6, "0")}`,
            cameraBrand: job.cameraBrand,
            cameraModel: job.cameraModel,
            serialNumber: job.serialNumber,
            status: job.status,
            accessories: job.accessories,
            physicalCondition: job.physicalCondition,
            notes: job.notes,
            createdAt: job.createdAt
        }))

        return res.status(200).json({
            message: "Customer details fetched successfully",
            details: {
                id: customer.id,
                name: customer.name,
                phNo: customer.phNo,
                address: customer.address,
                jobs
            }

        })
    } catch (err) {
        console.error(`Error while fetching customer details: ${err}`);
        return res.status(500).json({ message: "Internal server error" })
    }
})

/*
    {
        name *,
        phNo *,
        address
    }
*/
customerRouter.post("/details", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    //  add new customer
    try {
        const valid = customerSchema.safeParse(req.body);
        if (!valid.success) {
            return res.status(400).json({
                message: "Invalid inputs"
            })
        }
        const { name, phNo, address }: Customer = valid.data;

        const existingCustomer = await prisma.customer.findUnique({ where: { phNo } })
        if (existingCustomer) {
            if (!existingCustomer.isActive) {
                const updated = await prisma.customer.update({
                    where: { id: existingCustomer.id },
                    data: { isActive: true }
                })
                return res.status(200).json({ message: "Old customer reactivated", customer: updated });
            }
            return res.status(409).json({ message: "Customer alreay exists" });
        }

        await prisma.customer.create({
            data: {
                name,
                phNo,
                address: address || undefined
            }
        })

        return res.status(201).json({ message: "Customer created successfully" })
    } catch (err) {
        console.error("Error while creating customer: ", err);
        return res.status(500).json({ message: "Internal server error" })
    }
})

customerRouter.put("/details/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    //update customer details=>Get existing details(which doesn't require update)+upadted detail+id(obtanied from earlier req)
    try {
        const { id } = req.params;
        const parsed = customerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid inputs" })
        }
        const { name, phNo, address }: Customer = parsed.data;

        if (!id || typeof id !== "string") {
            return res.status(400).json({
                mesage: "Invalid customer id"
            })
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id },
            data: {
                name,
                phNo,
                address: address || undefined
            }
        })

        return res.status(200).json({
            message: "Customer details updated",
            customer: updatedCustomer
        })
    }
    catch (err: any) {
        if (err.code === "P2025") {
            return res.status(404).json({ message: "Customer not found" })
        }

        console.error("Error while updating customer details: ", err);
        return res.status(500).json({ message: " Internal server error" })
    }
})



export default customerRouter;