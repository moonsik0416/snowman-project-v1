
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const snowmanSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "눈사람의 외형적 특징을 담은 창의적인 한국어 이름" },
    description: { type: Type.STRING, description: "포켓몬 도감 스타일의 재치 있고 신비로운 한국어 설명" },
    type: { type: Type.STRING, description: "속성 (예: 서리, 진흙, 얼음, 요정, 도시)" },
    rarity: { 
      type: Type.STRING, 
      enum: ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical'],
      description: "희귀 등급"
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        creativity: { type: Type.INTEGER, description: "창의성 1-100" },
        roundness: { type: Type.INTEGER, description: "동글함 1-100" },
        accessories: { type: Type.INTEGER, description: "장식 수준 1-100" },
        chillFactor: { type: Type.INTEGER, description: "냉기 지수 1-100" },
        durability: { type: Type.INTEGER, description: "내구력 1-100" },
      },
      required: ["creativity", "roundness", "accessories", "chillFactor", "durability"]
    },
    funFact: { type: Type.STRING, description: "이 눈사람만의 독특하고 재미있는 비하인드 스토리 (한국어)" }
  },
  required: ["name", "description", "type", "rarity", "stats", "funFact"]
};

const cleanBase64 = (base64: string): string => {
  return base64.includes(",") ? base64.split(",")[1] : base64;
};

export const analyzeSnowman = async (base64Image: string): Promise<GeminiAnalysisResult> => {
  const pureBase64 = cleanBase64(base64Image);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: pureBase64 } },
        { text: "이 눈사람 사진을 도감용 데이터로 분석해줘. 이름과 설명은 아주 창의적이고 수집하고 싶게끔 매력적인 한국어로 작성해줘." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: snowmanSchema,
    }
  });

  if (!response.text) throw new Error("No response");
  return JSON.parse(response.text) as GeminiAnalysisResult;
};

export const generateSnowmanSticker = async (base64Image: string): Promise<string> => {
  const pureBase64 = cleanBase64(base64Image);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: pureBase64 } },
        { text: "Generate a cute, high-quality, flat vector sticker illustration of this snowman. Isolated on white background, thick white border, sticker style, vibrant colors, pokemon character design." }
      ]
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part?.inlineData?.data || "";
};
