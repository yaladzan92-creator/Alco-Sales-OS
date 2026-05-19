import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleAIError(error: any, fallbackMessage: string = "Generation failed") {
  console.error("AI Error:", error);
  const message = error.message || "";
  
  if (message.includes("QUOTA_EXCEEDED")) {
    toast.error("AI Quota Limit Reached", {
      description: "Gagal: Kuota harian Gemini API gratis telah habis (20 request/hari). Silakan tunggu beberapa jam atau coba lagi besok.",
      duration: 10000,
      id: "quota-error" // Prevent duplicate toasts
    });
    return;
  }
  
  if (message.includes("503") || message.includes("Overloaded") || message.includes("high demand")) {
    toast.error("AI Server Busy", {
      description: "Server Google sedang mengalami beban tinggi. Mencoba lagi secara otomatis di latar belakang mungkin diperlukan.",
    });
    return;
  }

  toast.error(fallbackMessage, {
    description: message.replace("QUOTA_EXCEEDED: ", ""),
    duration: 5000
  });
}
