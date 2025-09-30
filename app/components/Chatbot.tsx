import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { CloseIcon, ArrowIcon, CheckmarkIcon } from "outline-icons";
import { useChatbotSession } from "~/hooks/useChatbotSession";
import { ChatbotService } from "~/utils/chatbotService";
import ReactMarkdown from "react-markdown";

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
  width: 400px;
  height: 500px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transform: ${(props) =>
    props.isOpen ? "translateY(0)" : "translateY(calc(100% - 60px))"};
  transition: transform 0.3s ease;
  border: 1px solid #e5e7eb;
`;

const ChatbotHeader = styled.div`
  background: #f8f9fa;
  color: #374151;
  padding: 16px 20px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
`;

const HeaderTitle = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #3b82f6;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const ChatArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  background: ${(props) => (props.isUser ? "#3b82f6" : "#f3f4f6")};
  color: ${(props) => (props.isUser ? "#ffffff" : "#374151")};
  position: relative;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;

  /* Markdown styling */
  p {
    margin: 0 0 6px 0;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul,
  ol {
    margin: 6px 0;
    padding-left: 16px;
    word-wrap: break-word;
  }

  li {
    margin: 2px 0;
    word-wrap: break-word;
    word-break: break-word;
  }

  code {
    background: ${(props) =>
      props.isUser ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
    font-size: 13px;
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
  }

  pre {
    background: ${(props) =>
      props.isUser ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"};
    padding: 8px 12px;
    border-radius: 8px;
    margin: 6px 0;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    overflow-x: hidden;

    code {
      background: none;
      padding: 0;
      word-wrap: break-word;
      word-break: break-word;
      white-space: pre-wrap;
    }
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }

  blockquote {
    border-left: 3px solid
      ${(props) => (props.isUser ? "rgba(255, 255, 255, 0.5)" : "#d1d5db")};
    padding-left: 12px;
    margin: 6px 0;
    font-style: italic;
    word-wrap: break-word;
    word-break: break-word;
  }

  /* Links clicáveis */
  a {
    word-wrap: break-word;
    word-break: break-all;
    overflow-wrap: break-word;
    color: ${(props) => (props.isUser ? "#ffffff" : "#3b82f6")};
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: ${(props) => (props.isUser ? "#e5e7eb" : "#2563eb")};
    }
  }
`;

const MessageTimestamp = styled.div<{ isUser: boolean }>`
  font-size: 11px;
  color: #9ca3af;
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
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  background: #f9fafb;
  color: #374151;
  font-size: 14px;
  outline: none;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
  line-height: 1.4;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #3b82f6;
    background: #ffffff;
  }
`;

const SendButton = styled.button`
  background: #3b82f6;
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
    background: #2563eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  padding: 8px 20px;
  text-align: right;
  font-size: 11px;
  color: #9ca3af;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
`;

const PoweredBy = styled.span`
  color: #3b82f6;
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
        minute: "2-digit",
      }),
    },
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
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await ChatbotService.sendMessage(
        sessionId,
        currentMessage
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (_error) {
      // Handle error silently

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  return (
    <ChatbotContainer isOpen={isOpen}>
      <ChatbotHeader onClick={() => setIsOpen(!isOpen)}>
        <HeaderLeft>
          <StatusIndicator />
          <HeaderTitle>Store</HeaderTitle>
        </HeaderLeft>
        <CloseButton
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <CloseIcon size={16} />
        </CloseButton>
      </ChatbotHeader>

      {isOpen && (
        <>
          <ChatArea>
            {messages.map((message) => (
              <div key={message.id}>
                <MessageBubble isUser={message.isUser}>
                  {message.isUser ? (
                    message.text
                  ) : (
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  )}
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
              <MessageBubble isUser={false}>Digitando...</MessageBubble>
            )}
            <div ref={messagesEndRef} />
          </ChatArea>

          <InputArea>
            <InputContainer>
              <MessageInput
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma mensagem..."
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
            Powered by <PoweredBy>UOL Edtech</PoweredBy>
          </Footer>
        </>
      )}
    </ChatbotContainer>
  );
};

export default Chatbot;
