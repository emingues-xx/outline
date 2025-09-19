import React from "react";
import { useChatbotVisibility } from "../hooks/useChatbotVisibility";
import Chatbot from "./Chatbot";

const ChatbotWrapper: React.FC = () => {
    const shouldShowChatbot = useChatbotVisibility();

    if (!shouldShowChatbot) {
        return null;
    }

    return <Chatbot />;
};

export default ChatbotWrapper;
