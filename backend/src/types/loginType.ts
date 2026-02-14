import zod from "zod";

export interface userLogin {
    username: string;
    password: string;
}

export const userLoginSchema = zod.object({
    username: zod.string().max(10),
    password: zod.string().min(4)
});

