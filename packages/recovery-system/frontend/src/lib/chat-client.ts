const API_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
  sources?: string[];
  timestamp?: string;
  conversationId?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  importantDetails?: Array<{
    type: string;
    value: string;
    source: "user" | "assistant";
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const chatService = {
  async sendMessage(
    message: string,
    history?: ChatHistoryItem[],
    conversationId?: string
  ): Promise<ChatResponse> {
    const response = await fetch(`${API_URL}/api/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies for authentication
      body: JSON.stringify({ message, history, conversationId }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response.json();
  },

  async getChatHistory(): Promise<{ messages: ChatMessage[]; conversations?: ChatConversation[] }> {
    const response = await fetch(`${API_URL}/api/chat/history`, {
      credentials: "include", // Send cookies for authentication
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }

    return response.json();
  },
};
