import { useRef, useState } from "react";
import "./App.css";
import { useEvent } from "react-use";
const vscodeApi = acquireVsCodeApi();

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 监听来自 VS Code 扩展的消息
  useEvent("message", (e: MessageEvent<string>) => {
    console.log("Received message:", e.data);
    // 将接收到的消息追加到响应中
    setResponse(prev => prev + e.data);
  });

  // 从webview发送消息到extension后端
  const postMessage = async () => {
    const inputValue = inputRef.current?.value;
    if (inputValue) {
      setMessage(inputValue);
      setResponse(""); // 清空之前的响应
      vscodeApi.postMessage(inputValue);
    }
  };
  
  return (
    <>
      <div className="user-message">
        <strong>用户:</strong> {message}
      </div>
      <div className="ai-response">
        <strong>大模型返回:</strong> {response}
      </div>
      <div className="card">
        <input type="text" ref={inputRef} placeholder="Type your message here..."></input>
        <button onClick={() => postMessage()}>Send Message</button>
      </div>
      <p className="read-the-docs">
        interact with the extension using the buttons above to send and receive messages
      </p>
    </>
  );
}

export default App;
