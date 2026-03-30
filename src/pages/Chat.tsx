import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, Users, MessageCircle, Plus, Loader2, Hash
} from "lucide-react";
import { toast } from "sonner";

interface Room {
  id: string;
  name: string;
  description: string | null;
  type: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  room_id: string;
  profiles?: { display_name: string } | null;
}

const COMMUNITY_ROOM_ID = "00000000-0000-0000-0000-000000000001";

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch rooms
  useEffect(() => {
    if (!user) return;
    const fetchRooms = async () => {
      // Auto-join community room
      await supabase.from("chat_room_members").upsert(
        { room_id: COMMUNITY_ROOM_ID, user_id: user.id },
        { onConflict: "room_id,user_id" }
      );

      const { data } = await supabase
        .from("chat_rooms")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) {
        setRooms(data);
        if (!selectedRoom) setSelectedRoom(data[0] || null);
      }
      setLoading(false);
    };
    fetchRooms();
  }, [user]);

  // Fetch messages & subscribe
  useEffect(() => {
    if (!selectedRoom) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", selectedRoom.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data) {
        const userIds = [...new Set(data.map(m => m.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
        setMessages(data.map(m => ({ ...m, profiles: { display_name: profileMap.get(m.user_id) || "User" } })));
      }
    };
    fetchMessages();

    const channel = supabase
      .channel(`room-${selectedRoom.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `room_id=eq.${selectedRoom.id}`,
      }, async (payload) => {
        const { data } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("id", payload.new.id)
          .single();
        if (data) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", data.user_id)
            .single();
          setMessages((prev) => [...prev, { ...data, profiles: { display_name: profile?.display_name || "User" } }]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedRoom]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedRoom) return;
    setSending(true);

    const { error } = await supabase.from("chat_messages").insert({
      room_id: selectedRoom.id,
      user_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
    setSending(false);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Room list view
  if (!selectedRoom) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col">
        <div className="safe-area-top bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display font-bold text-foreground">Messages</h1>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                {room.type === "community" ? <Users size={18} /> : <MessageCircle size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{room.name}</p>
                <p className="text-xs text-muted-foreground truncate">{room.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="h-[100dvh] pb-14 bg-background flex flex-col">
      {/* Header */}
      <div className="safe-area-top bg-card border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => rooms.length > 1 ? setSelectedRoom(null) : navigate("/")}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary">
          <Hash size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{selectedRoom.name}</p>
          <p className="text-[10px] text-muted-foreground">{selectedRoom.type === "community" ? "Community" : "Direct"}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={32} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground/60">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${isOwn ? "order-1" : ""}`}>
                  {!isOwn && (
                    <p className="text-[10px] text-muted-foreground mb-0.5 ml-1">
                      {(msg as any).profiles?.display_name || "User"}
                    </p>
                  )}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-muted-foreground/60 mt-0.5 ${isOwn ? "text-right mr-1" : "ml-1"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="safe-area-bottom bg-card border-t border-border px-4 py-3 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="p-2.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
