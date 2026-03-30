import { MapPin, Phone, MessageCircle } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  initials: string;
  relation: string;
  status: "online" | "offline";
}

const contacts: Contact[] = [
  { id: "1", name: "Sarah M.", initials: "SM", relation: "Sister", status: "online" },
  { id: "2", name: "James K.", initials: "JK", relation: "Partner", status: "online" },
  { id: "3", name: "Mom", initials: "MO", relation: "Family", status: "offline" },
  { id: "4", name: "Alex R.", initials: "AR", relation: "Friend", status: "online" },
];

const TrustedContacts = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-foreground">Trusted Contacts</h3>
        <span className="text-xs text-muted-foreground">{contacts.filter(c => c.status === "online").length} online</span>
      </div>

      <div className="space-y-2">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-secondary-foreground">
                {contact.initials}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                  contact.status === "online" ? "bg-safe" : "bg-muted-foreground/40"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
              <p className="text-xs text-muted-foreground">{contact.relation}</p>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <Phone size={14} />
              </button>
              <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle size={14} />
              </button>
              <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <MapPin size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
        + Add Contact
      </button>
    </div>
  );
};

export default TrustedContacts;
