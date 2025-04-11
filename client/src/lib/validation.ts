import { z } from "zod";

// Validations for Brazilian format
const brazilianPhoneRegex = /^\+55 \(\d{2}\) 9\d{4}-\d{4}$/;
const brazilianDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

// User validation schema
export const userValidationSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().regex(brazilianPhoneRegex, "Formato inválido. Use: +55 (DDD) 9XXXX-XXXX"),
  birthdate: z.string().regex(brazilianDateRegex, "Formato inválido. Use: DD/MM/AAAA"),
  country: z.string().min(1, "País é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// Login validation schema
export const loginValidationSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Emergency contact validation schema
export const emergencyContactValidationSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  whatsapp: z.string().regex(brazilianPhoneRegex, "Formato inválido. Use: +55 (DDD) 9XXXX-XXXX"),
});

// Alarm config validation schema
export const alarmConfigValidationSchema = z.object({
  time: z.string().min(1, "Horário é obrigatório"),
  repeatInterval: z.number().min(1).max(24, "Intervalo deve ser entre 1 e 24 horas"),
  ringtone: z.string().min(1, "Som é obrigatório"),
});

// Password change validation schema
export const passwordChangeValidationSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Profile update validation schema
export const profileUpdateValidationSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  whatsapp: z.string().regex(brazilianPhoneRegex, "Formato inválido. Use: +55 (DDD) 9XXXX-XXXX"),
  birthdate: z.string().regex(brazilianDateRegex, "Formato inválido. Use: DD/MM/AAAA"),
  country: z.string().min(1, "País é obrigatório"),
});
