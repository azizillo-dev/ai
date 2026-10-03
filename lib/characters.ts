/** AI mentor qahramonlari — client va server bir xil ma'lumotdan foydalanadi */

export type CharacterId = "madina" | "jasur";

export interface Character {
  id: CharacterId;
  name: string;
  gender: "ayol" | "erkak";
  /** Gemini prebuilt ovozi */
  voice: string;
  colors: {
    hoodie: string;
    hoodieDark: string;
    shirt: string;
    skin: string;
    skinShade: string;
    hair: string;
    accent: string;
  };
}

export const CHARACTERS: Record<CharacterId, Character> = {
  madina: {
    id: "madina",
    name: "Madina",
    gender: "ayol",
    voice: "Kore",
    colors: {
      hoodie: "#7c5cf0",
      hoodieDark: "#6044d4",
      shirt: "#ddd3fe",
      skin: "#f6cfb2",
      skinShade: "#e9b394",
      hair: "#2b2238",
      accent: "#c3b2fc",
    },
  },
  jasur: {
    id: "jasur",
    name: "Jasur",
    gender: "erkak",
    voice: "Puck",
    colors: {
      hoodie: "#4f6bd8",
      hoodieDark: "#3c55b8",
      shirt: "#e6ebff",
      skin: "#efc3a0",
      skinShade: "#dca782",
      hair: "#2a2320",
      accent: "#9fb2f5",
    },
  },
};

export const isCharacterId = (v: unknown): v is CharacterId => v === "madina" || v === "jasur";
