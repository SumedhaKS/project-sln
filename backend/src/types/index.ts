import zod from "zod";

export const userLoginSchema = zod.object({
    username: zod.string().max(20),
    password: zod.string().min(4)
});

export const createUserSchema = zod.object({
    username: zod.string().max(20),
    password: zod.string().min(4),
    adminPassword: zod.string().min(4)
})

export const customerSchema = zod.object({
    name: zod.string().max(100),
    phNo: zod.string().min(10).max(20),
    address: zod.string().max(300).optional()
})

export interface Customer {
    name: string;
    phNo: string;
    address?: string;
}
