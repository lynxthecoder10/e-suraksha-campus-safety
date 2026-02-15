import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Shield } from 'lucide-react';
// import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  isResponder: boolean;
}

interface MessagingPanelProps {
  isAdmin?: boolean;
}

export default function MessagingPanel({ isAdmin = false }: MessagingPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // const { identity } = useInternetIdentity();

  useEffect(() => {
    // Simulate WebSocket connection
    setIsConnected(true);

    // Load mock messages
    const mockMessages: Message[] = [
      {
        id: '1',
        sender: 'Security Team',
        content: 'Hello! How can we assist you today?',
        timestamp: Date.now() - 3600000,
        isResponder: true,
      },
    ];
    setMessages(mockMessages);

    return () => {
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: isAdmin ? 'Security Team' : 'You',
      content: newMessage,
      timestamp: Date.now(),
      isResponder: isAdmin,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Simulate response after 2 seconds
    if (!isAdmin) {
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'Security Team',
          content: 'Thank you for your message. A responder will assist you shortly.',
          timestamp: Date.now(),
          isResponder: true,
        };
        setMessages((prev) => [...prev, response]);
      }, 2000);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Secure Messaging
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
        <CardDescription>
          {isAdmin
            ? 'Communicate with students and respond to inquiries'
            : 'Chat securely with campus security and responders'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isResponder ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.isResponder ? '/assets/generated/responder-avatar.dim_100x100.svg' : undefined} />
                  <AvatarFallback>
                    {message.isResponder ? <Shield className="h-4 w-4" /> : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 max-w-[70%] ${message.isResponder ? '' : 'text-right'}`}>
                  <div className={`inline-block p-3 rounded-lg ${message.isResponder
                    ? 'bg-muted'
                    : 'bg-primary text-primary-foreground'
                    }`}>
                    <p className="text-sm font-medium mb-1">{message.sender}</p>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            disabled={!isConnected}
          />
          <Button onClick={handleSendMessage} disabled={!isConnected || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
