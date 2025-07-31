import { useState, useEffect, useRef } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [aiReady, setAiReady] = useState(true);
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

  // use fech for get Api Open Router
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
      const respoone = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "appliction/json", // نوع داده
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`, // کلید API از .env
            "HTTP-Referer": "http://localhost:5173", // برای تأیید آدرس، اگه سایتی داری، اینجا بذار
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful AI assistant." },
              ...messages.map((msg) => ({
                role: msg.isUser ? "user" : "assistant",
                content: msg.content,
              })),
              { role: "user", content: message },
            ],
          }),
        }
      );

      const data = await respoone.json();
      const reply =
        data.choices?.[0]?.message?.content || "🟠 No reply received";
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

        <div className="w-full max-w-2xl bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-md border border-gray-600 rounded-3xl p-6 shadow-2xl">
          <div className="h-80 overflow-y-auto border-b border-gray-600 mb-6 p-4 bg-gradient-to-b from-gray-900/50 to-gray-800/50 rounded-2xl">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                ✋ Start the Conversation by typeing a message below.
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 m-2 rounded-2xl max-w-xs text-wrap ${
                  msg.isUser
                    ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white ml-auto text-right"
                    : "bg-gradient-to-r from-emerald-600 to-indigo-600 text-white"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}

            {isLoading && (
              <div className="p-3 m-2 rounded-2xl max-w-xs bg-gradient-to-r from-emerald-600 to-indigo-600 text-white">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onkeydown={handleKeyPress}
              placeholder={
                aiReady ? "type Your Message..." : "Wating for Ai to be ready"
              }
              disabled={!aiReady || isLoading}
              className="flex-1 px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:shadow-xl focus:shadow-sky-400/10 focus:right-sky-500 transition duration-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessge}
              disabled={!aiReady || isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-gradient-to-r from-sky-400 to-emerald hover:opacity-80 text-white font-semibold rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  Sending
                </div>
              ) : (
                "send"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
