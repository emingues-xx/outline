import env from "~/env";

export interface ChatbotRequest {
    session_id: string;
    message: string;
}

export interface ChatbotResponse {
    session_id: string;
    response: string;
}

export class ChatbotService {
    private static webhookUrl = env.CHATBOT_WEBHOOK_URL;

    static async sendMessage(
        sessionId: string,
        message: string
    ): Promise<ChatbotResponse> {
        if (!this.webhookUrl) {
            throw new Error("Chatbot webhook URL not configured");
        }

        const requestBody: ChatbotRequest = {
            session_id: sessionId,
            message: message,
        };

        const response = await fetch(this.webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ChatbotResponse = await response.json();
        return data;
    }
}
