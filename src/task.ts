import { XMLParser } from "fast-xml-parser";
import { readFile } from "node:fs/promises";
import * as path from "node:path";
import OpenAI from "openai";

import { AgentWebviewProvider } from "./agentWebviewProvider";
import APIHandler, { ApiConfiguration, historyItem } from "./APIHandler";

type AssistantMessageContent = ToolUse | TextContent;
type TextContent = {
  type: "text";
  content: string;
};

const toolName = ["attempt_completion"] as const;

type ToolName = (typeof toolName)[number];

const paramName = ["result"] as const;
type ParamName = (typeof paramName)[number];

type ToolUse = {
  type: "tool_use";
  name: ToolName;
  params: Partial<Record<ParamName, string>>;
};

export class Task {
  private systemPrompt: string = "";
  private history: historyItem[] = [];
  constructor(
    private provider: AgentWebviewProvider,
    private apiConfiguration: ApiConfiguration,
    private message: string
  ) {}
  async start() {
    this.history.push({ role: "user", content: this.message });
    await this.recursivelyMakeRequest(this.history);
  }

  async recursivelyMakeRequest(history: historyItem[]) {
    const apiHandler = new APIHandler(this.apiConfiguration);

    const systemPrompt = await this.getSystemPrompt();

    const stream = apiHandler.createMessage(systemPrompt, history);
    let assistantMessage = "";
    for await (const chunk of stream) {
      assistantMessage += chunk;
      this.provider.postMessage(chunk);
    }
    console.log(assistantMessage);
    this.history.push({ role: "assistant", content: assistantMessage });
    const assistantContent = this.parseAssistantMessage(assistantMessage);
    const toolUsed = this.presentAssistantMessage(assistantContent);
    
    // 检查是否使用了 attempt_completion 工具
    const hasAttemptCompletion = assistantContent.some(
      item => item.type === "tool_use" && item.name === "attempt_completion"
    );
    
    if (!toolUsed && !hasAttemptCompletion) {
      this.history.push({ role: "user", content: this.noToolUsed() });
      await this.recursivelyMakeRequest(this.history);
    }
    // 如果使用了 attempt_completion 工具，任务完成，不再继续递归
  }

  parseAssistantMessage(assistantMessage: string): AssistantMessageContent[] {
    try {
      const parser = new XMLParser();
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
    } catch {
      return [{ type: "text", content: assistantMessage }];
    }
  }

  presentAssistantMessage(
    assistantContent: AssistantMessageContent[]
  ): boolean {
    for (const item of assistantContent) {
      if (item.type === "tool_use") {
          return true;
      }
    }
    return false;
  }

  async getSystemPrompt() {
    if (this.systemPrompt) {
      return this.systemPrompt;
    }
    this.systemPrompt = await readFile(
      path.join(
        this.provider.context.extensionPath,
        "assets",
        "system_prompt.md"
      ),
      "utf8"
    );
    return this.systemPrompt;
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
