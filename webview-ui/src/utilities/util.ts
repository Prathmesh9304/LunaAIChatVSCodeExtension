import anthropic from "../../public/assets/logo/anthropic.svg";
import googleGemini from "../../public/assets/logo/google-gemini.svg";
import openAi from "../../public/assets/logo/openai.svg";
import mistralColor from "../../public/assets/logo/mistral-color.svg";
import ollama from "../../public/assets/logo/ollama.svg";
import groq from "../../public/assets/logo/groq.svg";

export const provider = [
  {
    logo: anthropic,
    name: "Anthropic",
    model: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229"],
  },
  {
    logo: googleGemini,
    name: "Google Gemini",
    model: [
      "gemini-3.5-flash",
      "gemini-3.1-pro",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
    ],
  },
  {
    logo: openAi,
    name: "OpenAI",
    model: [
      "gpt-4o",
      "gpt-4o-mini",
      "o3-mini",
      "gpt-4-turbo",
      "gpt-4",
      "gpt-3.5-turbo",
    ],
  },
  {
    logo: mistralColor,
    name: "Mistral",
    model: ["mistral-large-latest", "mistral-small-latest"],
  },
  {
    logo: ollama,
    name: "Ollama",
    model: ["llama3", "mistral"],
  },
  {
    logo: groq,
    name: "Groq",
    model: [
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "deepseek-r1-distill-llama-70b",
    ],
  },
];
