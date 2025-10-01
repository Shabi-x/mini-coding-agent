import { useRef, useState } from "react";
import "./App.css";
import { useEvent } from "react-use";
const vscodeApi = acquireVsCodeApi();

function App() {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEvent("message", (e: MessageEvent<string>) => {
    setMessage(e.data);
    console.log(e.data);
  });

  // 从webview发送消息到extension后端
  const postMessage = async () => {
    vscodeApi.postMessage(inputRef.current?.value);
  };
  return (
    <>
      <h1>{message}</h1>
      <div className="card">
        <input type="text" ref={inputRef}></input>
        <button onClick={() => postMessage()}>Send Message</button>
      </div>
      <p className="read-the-docs">
        interact with the extension using the buttons above to send and receive messages
      </p>
    </>
  );
}

export default App;
