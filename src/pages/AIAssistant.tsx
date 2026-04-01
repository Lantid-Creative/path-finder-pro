import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, Send, Loader2, Bot, User, Shield, AlertTriangle,
  MapPin, Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: Shield, label: "Is this area safe?", prompt: "Analyze the safety of my current area based on nearby reports and alerts." },
  { icon: MapPin, label: "Safe route home", prompt: "Suggest the safest route for me to get home from my current location." },
  { icon: AlertTriangle, label: "Emergency help", prompt: "I feel unsafe right now. What should I do immediately?" },
  { icon: Sparkles, label: "Safety tips", prompt: "Give me 5 practical safety tips for walking alone at night." },
];

const AIAssistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // Fetch nearby alerts for context
  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from("community_alerts")
        .select("type, message, location_name, latitude, longitude, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setNearbyAlerts(data);
    };
    fetchAlerts();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm **PATHLY AI**, your personal safety assistant.\n\nI can help you:\n- 🛡️ **Analyze area safety** based on community reports\n- 🗺️ **Suggest safer routes** for your journey\n- 🚨 **Provide emergency guidance** when you need it\n- 💡 **Share safety tips** for any situation\n\nHow can I help you stay safe today?",
      timestamp: new Date(),
    }]);
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const conversationHistory = [...messages.filter(m => m.id !== "welcome"), userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("ai-safety-assistant", {
        body: {
          messages: conversationHistory,
          location,
          nearbyAlerts,
        },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      toast.error("Failed to get AI response");
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm having trouble connecting right now. If you're in an emergency, **call 911 immediately**.",
        timestamp: new Date(),
      }]);
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-[100dvh] pb-14 bg-background flex flex-col">
      {/* Header */}
      <div className="safe-area-top bg-card border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate("/")} className="p-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
          <Bot size={16} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">PATHLY AI</p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-safe" />
            Safety Assistant
          </p>
        </div>
        {location && (
          <div className="flex items-center gap-1 bg-secondary rounded-full px-2 py-1">
            <MapPin size={10} className="text-primary" />
            <span className="text-[10px] text-muted-foreground">
              {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.role === "assistant" ? "bg-primary/15" : "bg-secondary"
              }`}>
                {msg.role === "assistant" ? (
                  <Bot size={14} className="text-primary" />
                ) : (
                  <User size={14} className="text-muted-foreground" />
                )}
              </div>
              <div className={`rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border text-foreground rounded-bl-md"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>p:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} className="text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Analyzing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts (show when few messages) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 grid grid-cols-2 gap-2">
          {quickPrompts.map((qp) => (
            <button
              key={qp.label}
              onClick={() => sendMessage(qp.prompt)}
              className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border text-left hover:bg-secondary/50 transition-colors"
            >
              <qp.icon size={16} className="text-primary shrink-0" />
              <span className="text-xs text-foreground font-medium">{qp.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="safe-area-bottom bg-card border-t border-border px-4 py-3 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about safety..."
            maxLength={500}
            className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
