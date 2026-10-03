/** Muhit o'zgaruvchisini tozalash: nusxalashda qolib ketgan probel, qator oxiri va qo'shtirnoqlar */
export const env = (name: string) => (process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");
