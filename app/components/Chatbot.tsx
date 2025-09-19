import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { CloseIcon, ArrowIcon, CheckmarkIcon } from "outline-icons";
import { useChatbotSession } from "~/hooks/useChatbotSession";
import { ChatbotService } from "~/utils/chatbotService";

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: string;
}

const ChatbotContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: ${(props) => props.theme.background};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transform: ${(props) => (props.isOpen ? "translateY(0)" : "translateY(calc(100% - 60px))")};
  transition: transform 0.3s ease;
  border: 1px solid ${(props) => props.theme.divider};
`;

const ChatbotHeader = styled.div`
  background: ${(props) => props.theme.accent};
  color: white;
  padding: 12px 16px;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
`;

const HeaderTitle = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ChatArea = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: ${(props) => props.theme.background};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  background: ${(props) =>
        props.isUser ? props.theme.accent : props.theme.backgroundSecondary};
  color: ${(props) =>
        props.isUser ? "white" : props.theme.text};
  border: ${(props) =>
        !props.isUser ? `1px solid ${props.theme.divider}` : "none"};
  position: relative;
`;

const MessageTimestamp = styled.div<{ isUser: boolean }>`
  font-size: 11px;
  color: ${(props) => props.theme.textSecondary};
  margin-top: 4px;
  text-align: ${(props) => (props.isUser ? "right" : "left")};
`;

const MessageStatus = styled.div`
  position: absolute;
  bottom: 2px;
  right: 4px;
  color: rgba(255, 255, 255, 0.7);
`;

const InputArea = styled.div`
  padding: 16px;
  border-top: 1px solid ${(props) => props.theme.divider};
  background: ${(props) => props.theme.background};
  border-radius: 0 0 12px 12px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid ${(props) => props.theme.divider};
  border-radius: 20px;
  background: ${(props) => props.theme.backgroundSecondary};
  color: ${(props) => props.theme.text};
  font-size: 14px;
  outline: none;
  
  &::placeholder {
    color: ${(props) => props.theme.textSecondary};
  }
  
  &:focus {
    border-color: ${(props) => props.theme.accent};
  }
`;

const SendButton = styled.button`
  background: ${(props) => props.theme.accent};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  
  &:hover {
    background: ${(props) => props.theme.accent};
    opacity: 0.9;
  }
  
  &:disabled {
    background: ${(props) => props.theme.textSecondary};
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  padding: 8px 16px;
  text-align: right;
  font-size: 11px;
  color: ${(props) => props.theme.textSecondary};
  background: ${(props) => props.theme.background};
  border-radius: 0 0 12px 12px;
`;

const PoweredBy = styled.span`
  color: ${(props) => props.theme.accent};
  font-weight: 500;
`;

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "👋 Olá! Estou aqui para te ajudar com qualquer dúvida. Como posso te auxiliar hoje? 😊",
            isUser: false,
            timestamp: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            })
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const sessionId = useChatbotSession();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            isUser: true,
            timestamp: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            })
        };

        setMessages(prev => [...prev, userMessage]);
        const currentMessage = inputValue;
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await ChatbotService.sendMessage(sessionId, currentMessage);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                isUser: false,
                timestamp: new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                })
            };
            setMessages(prev => [...prev, botMessage]);
    } catch (_error) {
      // Handle error silently

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
                isUser: false,
                timestamp: new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <ChatbotContainer isOpen={isOpen}>
            <ChatbotHeader onClick={() => setIsOpen(!isOpen)}>
                <HeaderLeft>
                    <StatusIndicator />
                    <HeaderTitle>Store</HeaderTitle>
                </HeaderLeft>
                <CloseButton onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                }}>
                    <CloseIcon size={16} />
                </CloseButton>
            </ChatbotHeader>

            {isOpen && (
                <>
                    <ChatArea>
                        {messages.map((message) => (
                            <div key={message.id}>
                                <MessageBubble isUser={message.isUser}>
                                    {message.text}
                                    {message.isUser && (
                                        <MessageStatus>
                                            <CheckmarkIcon size={12} />
                                        </MessageStatus>
                                    )}
                                </MessageBubble>
                                <MessageTimestamp isUser={message.isUser}>
                                    {message.timestamp}
                                </MessageTimestamp>
                            </div>
                        ))}
                        {isLoading && (
                            <MessageBubble isUser={false}>
                                Typing...
                            </MessageBubble>
                        )}
                        <div ref={messagesEndRef} />
                    </ChatArea>

                    <InputArea>
                        <InputContainer>
                            <MessageInput
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Write a message..."
                                disabled={isLoading}
                            />
                            <SendButton
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                            >
                                <ArrowIcon size={16} />
                            </SendButton>
                        </InputContainer>
                    </InputArea>

                    <Footer>
                        Powered by <PoweredBy>Outline</PoweredBy>
                    </Footer>
                </>
            )}
        </ChatbotContainer>
    );
};

export default Chatbot;
