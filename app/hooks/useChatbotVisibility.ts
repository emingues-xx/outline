import { useLocation } from "react-router-dom";

export const useChatbotVisibility = (): boolean => {
    const location = useLocation();

    // Não mostrar o chatbot em páginas de configurações
    const isSettingsPage = location.pathname.startsWith('/settings');

    return !isSettingsPage;
};
