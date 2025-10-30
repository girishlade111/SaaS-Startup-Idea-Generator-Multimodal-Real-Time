import { GoogleGenAI, Type } from "@google/genai";
import type { Idea, FormState, GroundingSource } from '../types';
import { v4 as uuidv4 } from 'uuid';


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ideaSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The name of the SaaS idea." },
    tagline: { type: Type.STRING, description: "A catchy tagline for the product." },
    description: { type: Type.STRING, description: "A detailed description of the SaaS product." },
    targetProblem: { type: Type.STRING, description: "The specific problem this SaaS solves." },
    marketSize: { type: Type.STRING, description: "An estimated market size, informed by web search." },
    coreFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 3-5 core features."
    },
    techStack: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A suggested technology stack."
    },
    revenueModel: { type: Type.STRING, description: "The primary revenue model (e.g., Subscription, Freemium)." },
    pricingStrategy: { type: Type.STRING, description: "A brief on the pricing strategy." },
    competitiveLandscape: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          player: { type: Type.STRING, description: "The name of the competitor." },
          pricing: { type: Type.STRING, description: "Their pricing model, e.g., '$29/mo', 'Freemium', 'Contact for quote'." },
          marketShare: { type: Type.STRING, description: "Estimated market share, if available from search." },
          keyDifferentiators: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of what makes this competitor stand out."
          }
        },
        required: ['player', 'keyDifferentiators']
      },
      description: "Analysis of 1-2 key competitors, including their pricing, market share, and key differentiators, based on web search results."
    },
    feasibilityScore: { type: Type.NUMBER, description: "A score from 1-10 on technical feasibility." },
    marketValidationScore: { type: Type.NUMBER, description: "A score from 1-100 on market need and viability, based on search results." },
    launchStrategy: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of key steps to launch the product."
    },
  },
   required: [
    'name', 'tagline', 'description', 'targetProblem', 'marketSize', 'coreFeatures', 'techStack',
    'revenueModel', 'pricingStrategy', 'competitiveLandscape', 'feasibilityScore', 'marketValidationScore', 'launchStrategy'
  ]
};


export const geminiService = {
  generateSaaSIdeas: async (formData: FormState): Promise<{ ideas: Idea[], sources: GroundingSource[] }> => {
    const prompt = `
      You are an expert SaaS startup consultant. Based on the following user inputs, generate 2 distinct and innovative SaaS startup ideas.
      Use the provided web search query to ground your ideas in real-time data, recent trends, and validate the market need.

      User Inputs:
      - Core Idea/Problem: ${formData.textInput || 'Not provided'}
      - Industry: ${formData.industry || 'Any'}
      - Target Audience: ${formData.targetAudience || 'Any'}
      - Web Search Query for Grounding: ${formData.searchQuery}

      For each idea, provide a detailed breakdown.
      Ensure the 'marketValidationScore' and 'feasibilityScore' are realistically informed by the search results.
      For the 'competitiveLandscape', analyze 1-2 key competitors found via search. For each competitor, provide their pricing model (e.g., '$29/mo', 'Freemium'), estimated market share if available, and a list of their key differentiators. This information should directly inform the analysis.
      
      Your final response must be a single JSON array containing the 2 idea objects, enclosed in a markdown code block like so:
      \`\`\`json
      [
        { /* idea 1 */ },
        { /* idea 2 */ }
      ]
      \`\`\`
    `;

    try {
      // FIX: Per @google/genai guidelines, `responseMimeType` and `responseSchema`
      // are not allowed when using the `googleSearch` tool. The prompt has been
      // updated to explicitly request JSON output in a code block, and logic is
      // added below to extract it.
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      const responseText = response.text;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      const ideasData = JSON.parse(jsonString);

      const ideas: Idea[] = ideasData.map((ideaData: any) => ({
        ...ideaData,
        id: uuidv4(),
        logoIdeaUrl: `https://picsum.photos/seed/${encodeURIComponent(ideaData.name)}/100/100`
      }));

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      return { ideas, sources };

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error("Failed to generate ideas from the AI model. Please check your inputs and try again.");
    }
  },

  generateLogo: async (idea: Idea, userPrompt?: string): Promise<string> => {
    let prompt = `
      A modern, minimalist logo for a SaaS startup called '${idea.name}'.
      The company's focus is: '${idea.description}'.
      The logo should be simple, memorable, and suitable for a tech company.
      Style: vector, flat design, single color on a dark background.
    `;

    if (userPrompt) {
      prompt += `\n\nUser guidance for regeneration: "${userPrompt}"`;
    }

    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
      });
      
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      if (!base64ImageBytes) {
        throw new Error("The API did not return an image.");
      }
      
      return `data:image/png;base64,${base64ImageBytes}`;

    } catch (error) {
      console.error("Error calling Imagen API:", error);
      throw new Error("Failed to generate a logo from the AI model.");
    }
  },
};