import { useState, useEffect, useRef } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [aiReady, setAiReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // for scrolling messages we use of useRef
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkReady = setInterval(() => {
      if (
        window.puter &&
        window.puter.ai &&
        typeof window.puter.ai.chat === "function"
      ) {
        setAiReady(true);
        clearInterval(checkReady);
      }
    }, 300);
    return () => clearInterval(checkReady);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMesages = (msg, isUser) => {
    setMessages((prev) => [
      ...prev,
      { content: msg, isUser, id: Date.now() + Math.random() },
    ]);
  };

  const sendMessge = async () => {
    const message = inputValue.trim();
    if (!message) return;

    if (!aiReady) {
      addMesages("Ai service is still loading. Please wait...", false);
      return;
    }

    addMesages(message, true);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await window.puter.ai.chat(message);

      const reply =
        typeof response === "string"
          ? response
          : response.message?.content || " 🟠 No reply recived";

      addMesages(reply, false);
    } catch (err) {
      addMesages(`Error: ${err.message || "🔴Somthing went Wrong."}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftkey) {
      e.preventDefalut();
      sendMessge();
    }
  };
  useEffect(scrollToBottom, [messages]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-sky-900 via-slate-950 to-emerald-900 flex flex-col items-center justify-center p-4 gap-8">
        <h1 className="text-6xl sm:text-7xl font-light bg-gradient-to-r from-emerald-400 via-sky-300 to-blue-500 bg-clip-text text-transparent text-center h-20">
          Ai Chat App
        </h1>

        <div
          className={`px-4 py-2 rounded-full text-sm${
            aiReady
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20"
          }`}
        >
          {aiReady ? "🟢 Ai Ready" : "🟡 Waiting for Ai..."}
        </div>
      </div>
    </>
  );
}

export default App;
