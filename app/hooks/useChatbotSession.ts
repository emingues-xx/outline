import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export const useChatbotSession = () => {
    const [sessionId, setSessionId] = useState<string>("");

    useEffect(() => {
        // Try to get existing session from localStorage
        const existingSession = localStorage.getItem("chatbot-session-id");

        if (existingSession) {
            setSessionId(existingSession);
        } else {
            // Create new session
            const newSessionId = uuidv4();
            localStorage.setItem("chatbot-session-id", newSessionId);
            setSessionId(newSessionId);
        }
    }, []);

    return sessionId;
};
