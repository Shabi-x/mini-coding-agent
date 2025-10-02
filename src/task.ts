import { AgentWebviewProvider } from "./agentWebviewProvider";
import APIHandler, { ApiConfiguration, historyItem } from "./APIHandler";
import { OpenAI } from "openai";

import { readFile } from "node:fs/promises";
import * as path from "path";

import { XMLParser } from "fast-xml-parser";

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
  private history: historyItem[] = [];
  constructor(
    private provider: AgentWebviewProvider,
    private apiConfiguration: ApiConfiguration,
    private message: string
  ) {
    const { model, apiKey, BaseUrl } = this.apiConfiguration;
  }
  async start() {
    this.history.push({ role: "user", content: this.message });
    await this.recursivelyMakeRequest(this.history);
  }

  async recursivelyMakeRequest(history: historyItem[]) {
    const apiHandler = new APIHandler(this.apiConfiguration);
    const systemPrompt = await this.GetSystemPrompt();
    const stream = apiHandler.createMessage(systemPrompt, history);
    let assistantMessage: string = "";
    for await (const chunk of stream) {
      assistantMessage += chunk;
      const messageStr =
        typeof chunk === "string" ? chunk : JSON.stringify(chunk);
      this.provider.postMessage(messageStr);
    }
    this.history.push({ role: "assistant", content: assistantMessage });
    const assistantContent = this.ParseAssistantMessage(assistantMessage);
    const tool_used = this.PresentAssistantMessage(assistantContent);

    if (!tool_used) {
      this.history.push({ role: "user", content: assistantMessage });
      await this.recursivelyMakeRequest(this.history);
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

  // 解析大模型返回的消息，提取出代码块
  ParseAssistantMessage(assistantMessage: string): AssistantMessageContent[] {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      const content = parser.parse(assistantMessage);
      if ("attempt_completion" in content) {
        return [
          {
            type: "tool_use",
            name: "attempt_completion",
            params: content["attempt_completion"],
          },
        ];
      }
      return [];
    } catch (error) {
      return [{ type: "text", content: assistantMessage }];
    }
  }

  // 展示大模型返回的代码块
  PresentAssistantMessage(assistantContent: AssistantMessageContent[]): boolean {
    for (const item of assistantContent) {
      if (item.type === "tool_use") {
        return true;
      }
    }
    return false;
  }

  noToolUsed() {
    return `[ERROR] You did not use a tool in your previous response! Please retry with a tool use.
# Reminder: Instructions for Tool Use

Tool uses are formatted using XML-style tags. The tool name itself becomes the XML tag name. Each parameter is enclosed within its own set of tags. Here's the structure:

<actual_tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</actual_tool_name>

For example, to use the attempt_completion tool:

<attempt_completion>
<result>
I have completed the task...
</result>
</attempt_completion>

Always use the actual tool name as the XML tag name for proper parsing and execution.

# Next Steps

If you have completed the user's task, use the attempt_completion tool.
If you require additional information from the user, use the ask_followup_question tool.
Otherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task.
(This is an automated message, so do not respond to it conversationally.)`;
  }
}
