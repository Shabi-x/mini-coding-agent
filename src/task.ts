import { AgentWebviewProvider } from "./agentWebviewProvider";
import APIHandler, { ApiConfiguration } from "./APIHandler";
import { OpenAI } from "openai";

import { readFile } from "node:fs/promises";
import * as path from "path";

const toolName = ["attempt_completion", "read_file"] as const;
const paramsName = ["result", "filename"] as const;
export type ToolName = (typeof toolName)[number];
export type ParamsName = (typeof paramsName)[number];
type ToolUse = {
  type: "tool_use";
  name: ToolName;
  params: Partial<Record<ParamsName, string>>;
};
type TextContent = {
  type: "text";
  content: string;
};
type AssistantMessageContent = ToolUse | TextContent;
// 实现与大模型交互相关的逻辑
export class Task {
  private systemPrompt: string = "";
  constructor(
    private provider: AgentWebviewProvider,
    private apiConfiguration: ApiConfiguration,
    private message: string
  ) {
    const { model, apiKey, BaseUrl } = this.apiConfiguration;
  }
  async start() {
    const apiHandler = new APIHandler(this.apiConfiguration);
    const systemPrompt = await this.GetSystemPrompt();
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: this.message,
      },
    ];
    const stream = apiHandler.createMessage(systemPrompt, messages);
    let assistantMessage: string = "";
    for await (const chunk of stream) {
      console.log(chunk);
      assistantMessage += chunk;
      const messageStr =
        typeof chunk === "string" ? chunk : JSON.stringify(chunk);
      this.provider.postMessage(messageStr);
    }
    const assistantContent = this.ParseAssistantMessage(assistantMessage);
    this.PresentAssistantMessage();
  }

  async GetSystemPrompt() {
    if (this.systemPrompt) {
      return this.systemPrompt;
    }
    this.systemPrompt = await readFile(
      path.join(
        this.provider.context.extensionPath,
        "assets",
        "system_prompt.md"
      ),
      "utf-8"
    );
    return this.systemPrompt;
  }

  // 解析大模型返回的消息，提取出代码块
  ParseAssistantMessage(assistantMessage: string): AssistantMessageContent[] {
    return [];
  }

  // 展示大模型返回的代码块
  PresentAssistantMessage() {
  }
}
