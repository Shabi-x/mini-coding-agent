import { useState } from "react";
import "./App.css";
import { useEvent } from "react-use";
const vscodeApi = acquireVsCodeApi();

function App() {
  const [message, setMessage] = useState("");
  useEvent("message", (e: MessageEvent<string>) => {
    setMessage(e.data);
    console.log(e.data);
  });

  const postMessage = async () => {
    vscodeApi.postMessage("helloWorld");
  };
  return (
    <>
      <h1>{message}</h1>
      <div className="card">
        <button onClick={() => setMessage("helloWorld")}>Send Message</button>
        <button onClick={() => postMessage()}>Post Message</button>
      </div>
      <p className="read-the-docs">
        interact with the extension using the buttons above to send and receive messages
      </p>
    </>
  );
}

export default App;
