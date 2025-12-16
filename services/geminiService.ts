import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getCountryHint = async (targetName: string, contextInfo: string[] = []): Promise<string> => {
    if (!apiKey) return "Skonfiguruj klucz API, aby otrzymać podpowiedź.";

    const contextText = contextInfo.length > 0 
        ? `Kontekst (np. sąsiedzi lub kraje wchodzące w skład): ${contextInfo.slice(0, 4).join(', ')}.` 
        : "";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Jesteś pomocnikiem w grze geograficznej. Gracz szuka na mapie: ${targetName}. 
            (Może to być państwo, wyspa, archipelag lub półwysep).
            Napisz krótką podpowiedź (1 zdanie) nie wymieniając nazwy tego miejsca. 
            Możesz nawiązać do kształtu granic, położenia na kontynencie lub charakterystycznych cech.
            ${contextText}`,
        });
        return response.text || "Brak podpowiedzi.";
    } catch (error) {
        return "Spróbuj poszukać blisko środka mapy lub na obrzeżach!";
    }
}