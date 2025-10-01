export type ApiConfiguration = {
  model: string;
  apiKey: string;
  BaseUrl: string;
};

import { OpenAI } from "openai";
export default class APIHandler {
  constructor(private apiConfiguration: ApiConfiguration) {
    const { model, apiKey, BaseUrl } = this.apiConfiguration;
  }

  async *createMessage(
    systemPrompt: string,
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  ) {
    const client = new OpenAI({
      apiKey: this.apiConfiguration.apiKey,
      baseURL: this.apiConfiguration.BaseUrl,
    });

    const request: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming =
      {
        stream: true,
        model: this.apiConfiguration.model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      };

    const { data: completions } = await client.chat.completions
      .create(request)
      .withResponse();

    // 使用 for await...of 循环遍历 OpenAI 返回的流式响应
    // completions 是一个异步可迭代对象，包含了 AI 模型生成的所有文本块
    // 每个chunk代表模型生成的一部分内容，通过流式传输逐步返回
    for await (const chunk of completions) {
      // 如果存在内容，则通过 yield 关键字将这部分内容返回给调用者
      // 这样调用者可以逐步接收 AI 生成的文本，而不需要等待整个响应完成
      if (chunk.choices[0].delta.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  }
}
