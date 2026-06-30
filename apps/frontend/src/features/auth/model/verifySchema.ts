import z from "zod"

export const verifySchema = z.object({
  code: z.string().length(6, 'Код должен состоять из 6 цифр').regex(/^\d+$/, 'Только цифры'),
})

export type VerifyFormValues = z.infer<typeof verifySchema>