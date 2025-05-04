import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Smile, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { getMessagesByConversationId, getConversationByUserId, sendMessageToServer } from "@/services/chat-list-service";
import { encryptMessage, decryptMessage } from "@/lib/cryptoFunctions";

const ChatInbox = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [conversionInfo, setConversionInfo] = useState(null);
  const [decryptedMessages, setDecryptedMessages] = useState([]); // New state for decrypted messages

  let user = localStorage.getItem("userData");
  const privateKey = user ? JSON.parse(user).privateKey : '';
  user = user ? JSON.parse(user).user : {};

  useEffect(() => {
    if (selectedUser?.id) {
      const fetchConversationAndMessages = async () => {
        setLoading(true);
        try {
          // Fetch the conversation for the selected user
          const conversationResponse = await getConversationByUserId(selectedUser.id);
          if (conversationResponse.status === 200) {
            setConversionInfo(conversationResponse.data);
            const conversationId = conversationResponse.data.id;

            // Fetch messages using the conversation ID
            const messagesResponse = await getMessagesByConversationId(conversationId);
            if (messagesResponse.status === 200) {
              setRecipientInfo(messagesResponse.data.recipient);
              setMessages(messagesResponse.data.messages || []);
            } else {
              console.error("Failed to fetch messages:", messagesResponse.message);
            }
          } else {
            console.error("Failed to fetch conversation:", conversationResponse.message);
          }
        } catch (error) {
          console.error("Error fetching conversation or messages:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchConversationAndMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    const decryptMessages = async () => {
      const decrypted = await Promise.all(
        messages.map(async (msg) => {
          const decryptedMessage = await decryptMessage(
            msg.message,
            msg.sender_id === user?.id ? msg.sender_decrypt_key : msg.receiver_decrypt_key,
            msg.iv,
            privateKey,
            msg.auth_tag
          );
          return { ...msg, decryptedMessage };
        })
      );
      setDecryptedMessages(decrypted); // Update decrypted messages state
    };

    if (messages.length > 0) {
      decryptMessages();
    }
  }, [messages, privateKey, user?.id]); // Removed dependency on decryptedMessages

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      const { user } = JSON.parse(localStorage.getItem("userData"));
      const senderPublicKey = user?.public_key;
      const recipientPublicKey = recipientInfo?.public_key;
      const encryptedData = await encryptMessage(inputMessage, senderPublicKey, recipientPublicKey);

      // Send the encrypted message to the server
      const response = await sendMessageToServer({
        message: encryptedData.encryptedMessage,
        senderDecryptKey: encryptedData.encryptedKeyForSender,
        receiverDecryptKey: encryptedData.encryptedKeyForRecipient,
        iv: encryptedData.iv,
        recipientId: selectedUser.id,
        conversationId: conversionInfo?.id,
        authTag: encryptedData.authTag,
      });

      if (response.status === 200) {
        setInputMessage(""); // Clear the input field
      } else {
        console.error("Failed to send message:", response.message);
      }
    } catch (error) {
      console.error("Error encrypting or sending message:", error);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={selectedUser.avatar || "https://github.com/shadcn.png"} />
            <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold">{selectedUser.name}</h2>
            <p className="text-xs text-gray-500">online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : (
          decryptedMessages.map((msg) => ( // Use decryptedMessages for rendering
            <div
              key={msg.id}
              className={`flex my-1 ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 text-sm max-w-xs shadow ${msg.sender_id === user?.id ? "bg-green-100 text-black" : "bg-white text-black border"
                  }`}
              >
                <p>{msg.decryptedMessage}</p>
                <p className="text-xs text-gray-500 text-right mt-1">{msg.created_at}</p>
              </div>
            </div>
          ))
        )}
      </ScrollArea>

      {/* Input */}
      <div className="flex items-center gap-1 p-4 border-t bg-white">
        <Input
          placeholder="Type a message"
          className="flex-1 rounded-full border-gray-300"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <Button
          size="icon"
          className="bg-green-500 text-white hover:bg-green-600"
          onClick={handleSendMessage}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInbox;
