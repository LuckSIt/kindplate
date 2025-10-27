import { array, z } from "zod";
import { ymapsDirectGeocode } from "./ymaps";

export const loginSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export const customerRegisterSchema = z
    .object({
        email: z.string().email("Неверный формат"),
        name: z
            .string()
            .min(3, "Имя должно быть не короче 3 символов")
            .max(100, "Имя должно быть не длиннее 100 символов"),
        password: z
            .string()
            .min(6, "Пароль должен быть не короче 6 символов")
            .max(50, "Пароль должен быть не длиннее 50 символов"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Пароли должны совпадать",
        path: ["confirmPassword"],
    });

export const businessRegisterSchema = z
    .object({
        email: z.string().email("Неверный формат"),
        name: z
            .string()
            .min(3, "Имя должно быть не короче 3 символов")
            .max(100, "Имя должно быть не длиннее 100 символов"),
        password: z
            .string()
            .min(6, "Пароль должен быть не короче 6 символов")
            .max(50, "Пароль должен быть не длиннее 50 символов"),
        confirmPassword: z.string(),
        address: z
            .string()
            .min(10, "Адрес слишком короткий")
            .max(200, "Адрес слишком длинный"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Пароли должны совпадать",
        path: ["confirmPassword"],
    });
