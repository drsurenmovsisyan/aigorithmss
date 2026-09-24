import ky from "ky";
import { toast } from "sonner";
import { useState } from "react";
import { 
  BotIcon,
  CopyIcon, 
  HistoryIcon, 
  LoaderIcon, 
  PlusIcon
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useConversation,
  useConversations,
  useCreateConversation,
  useMessages,
} from "../hooks/use-conversations";

import { Id } from "../../../../convex/_generated/dataModel";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import { PastConversationsDialog } from "./past-conversations-dialog";

interface ConversationSidebarProps {
  projectId: Id<"projects">;
};

export const ConversationSidebar = ({
  projectId,
}: ConversationSidebarProps) => {
  const [input, setInput] = useState("");
  const [modelId, setModelId] = useState("anthropic/claude-3-haiku");
  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<Id<"conversations"> | null>(null);
  const [
    pastConversationsOpen,
    setPastConversationsOpen
  ] = useState(false);

  const createConversation = useCreateConversation();
  const conversations = useConversations(projectId);

  const activeConversationId =
    selectedConversationId ?? conversations?.[0]?._id ?? null;

  const activeConversation = useConversation(activeConversationId);
  const conversationMessages = useMessages(activeConversationId);

  // Check if any message is currently processing
  const isProcessing = conversationMessages?.some(
    (msg) => msg.status === "processing"
  );

  const handleCancel = async () => {
    try {
      await ky.post("/api/messages/cancel", {
        json: { projectId },
      });
    } catch {
      toast.error("Unable to cancel request");
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConversationId = await createConversation({
        projectId,
        title: DEFAULT_CONVERSATION_TITLE,
      });
      setSelectedConversationId(newConversationId);
      return newConversationId;
    } catch {
      toast.error("Unable to create new conversation");
      return null;
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    // If processing and no new message, this is just a stop function
    if (isProcessing && !message.text) {
      await handleCancel()
      setInput("");
      return;
    }

    let conversationId = activeConversationId;

    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) {
        return;
      }
    }

    // Trigger Inngest function via API
    try {
      await ky.post("/api/messages", {
        json: {
          conversationId,
          message: message.text,
          modelId,
        },
      });
    } catch {
      toast.error("Message failed to send");
    }

    setInput("");
  }

  return (
    <>
      <PastConversationsDialog
        projectId={projectId}
        open={pastConversationsOpen}
        onOpenChange={setPastConversationsOpen}
        onSelect={setSelectedConversationId}
      />
      <div className="flex flex-col h-full bg-sidebar">
        <div className="h-8.75 flex items-center justify-between border-b">
          <div className="text-sm truncate pl-3">
            {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
          </div>
          <div className="flex items-center px-1 gap-1">
            <Button
              size="icon-xs"
              variant="highlight"
              onClick={() => setPastConversationsOpen(true)}
            >
              <HistoryIcon className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="highlight"
              onClick={handleCreateConversation}
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </div>
        </div>
        <Conversation className="flex-1">
          <ConversationContent>
            {conversationMessages?.map((message, messageIndex) => (
              <Message
                key={message._id}
                from={message.role}
              >
                <MessageContent>
                  {message.status === "processing" ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <LoaderIcon className="size-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : message.status === "cancelled" ? (
                    <span className="text-muted-foreground italic">
                      Request cancelled
                    </span>
                  ) : (
                    <MessageResponse>{message.content}</MessageResponse>
                  )}
                </MessageContent>
                {message.role === "assistant" &&
                  message.status === "completed" &&
                  messageIndex === (conversationMessages?.length ?? 0) - 1 && (
                    <MessageActions>
                      <MessageAction
                        onClick={() => {
                          navigator.clipboard.writeText(message.content)
                        }}
                        label="Copy"
                      >
                        <CopyIcon className="size-3" />
                      </MessageAction>
                    </MessageActions>
                  )
                }
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="p-3">
          <PromptInput 
            onSubmit={handleSubmit}
            className="mt-2"
          >
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask Aigorithm anything..."
                onChange={(e) => setInput(e.target.value)}
                value={input}
                disabled={isProcessing}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-muted-foreground">
                      <BotIcon className="size-3.5" />
                      {modelId.split("/").pop()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="w-64">
                    <DropdownMenuLabel>Select Model</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Anthropic</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setModelId("anthropic/claude-3-haiku")}>claude-3-haiku</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setModelId("anthropic/claude-haiku-4.5")}>claude-haiku-4.5</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setModelId("anthropic/claude-sonnet-4")}>claude-sonnet-4</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setModelId("anthropic/claude-sonnet-4.5")}>claude-sonnet-4.5</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">OpenAI</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setModelId("openai/gpt-4o")}>gpt-4o</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setModelId("openai/gpt-4o-mini")}>gpt-4o-mini</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Google</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setModelId("google/gemini-2.5-flash")}>gemini-2.5-flash</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setModelId("google/gemini-2.5-pro")}>gemini-2.5-pro</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">DeepSeek</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setModelId("deepseek/deepseek-chat-v3-0324")}>deepseek-v3</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setModelId("deepseek/deepseek-r1")}>deepseek-r1</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Alibaba Qwen</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setModelId("qwen/qwen-2.5-72b-instruct")}>qwen-2.5-72b</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setModelId("qwen/qwen3-235b-a22b")}>qwen3-235b</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">ZhipuAI (GLM)</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setModelId("z-ai/glm-4.7")}>glm-4.7</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setModelId("z-ai/glm-5.2:free")}>glm-5.2 (free)</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={isProcessing ? false : !input}
                status={isProcessing ? "streaming" : undefined}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
};