import { useState, useEffect } from 'react';
import { decryptMessage } from "@/lib/cryptoFunctions";

export function useMessageHandling(messages, privateKey, userId) {
    const [decryptedMessages, setDecryptedMessages] = useState([]);

    useEffect(() => {
        const decryptMessages = async () => {
            try {
                if (!privateKey) {
                    console.error("Private key is not available for decryption");
                    return;
                }

                const decrypted = await Promise.all(
                    messages.map(async (msg) => {
                        try {
                            const decryptKey = msg.sender_id === userId ? msg.sender_decrypt_key : msg.receiver_decrypt_key;
                            if (!msg.message || !decryptKey || !msg.iv || !privateKey) {
                                console.warn("Missing required decryption parameters for message:", msg.id);
                                return {
                                    ...msg,
                                    decryptedMessage: "Unable to decrypt message (missing data)"
                                };
                            }

                            try {
                                const decryptedMessage = await decryptMessage(
                                    msg.message,
                                    decryptKey,
                                    msg.iv,
                                    privateKey,
                                    msg.auth_tag
                                );
                                return { ...msg, decryptedMessage };
                            } catch (decryptError) {
                                console.error(`Decryption failed for message ${msg.id}:`, decryptError);

                                return {
                                    ...msg,
                                    decryptedMessage: "Unable to decrypt message"
                                };
                            }
                        } catch (error) {
                            console.error("Error handling message decryption:", error);
                            return {
                                ...msg,
                                decryptedMessage: "Unable to decrypt message"
                            };
                        }
                    })
                );
                setDecryptedMessages(decrypted);
            } catch (error) {
                console.error("Error in decryption process:", error);
            }
        };

        if (messages.length > 0 && privateKey) {
            decryptMessages();
        } else {
            setDecryptedMessages([]);
        }
    }, [messages, privateKey, userId]);

    return { decryptedMessages };
}
