import { AgentWebviewProvider } from "./agentWebviewProvider";
import APIHandler, { ApiConfiguration } from "./APIHandler";
import { OpenAI } from "openai";

import { readFile } from "node:fs/promises";
import * as path from "path";

// 实现与大模型交互相关的逻辑
export class Task {
  private systemPrompt: string = "";
  constructor(
    private provider: AgentWebviewProvider,
    private apiConfiguration: ApiConfiguration,
    private message: string,
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
    for await (const chunk of stream) {
      console.log(chunk);
      const messageStr =
        typeof chunk === "string" ? chunk : JSON.stringify(chunk);
      this.provider.postMessage(messageStr);
    }
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
}
