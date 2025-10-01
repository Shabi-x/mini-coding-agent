import { start } from "repl";
import APIHandler, { ApiConfiguration } from "./APIHandler";
import { OpenAI } from "openai";

// 实现与大模型交互相关的逻辑
export class Task {
  constructor(private apiConfiguration: ApiConfiguration, private message: string) {
    const { model, apiKey, BaseUrl } = this.apiConfiguration;
  }
  async start() {
    const apiHandler = new APIHandler(this.apiConfiguration);
    const systemPrompt = "";
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
      role: "user",
      content: this.message,
    }];
    const stream = apiHandler.createMessage(systemPrompt, messages);
    for await (const chunk of stream) {
      console.log(chunk);
    }
  }
}
