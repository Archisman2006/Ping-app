import {z} from 'zod'

export const messageSchema=z.object({
    content:z
    .string()
    .min(1,"Message is empty")
    .max(500,"Message must be less than 500 characters")
})