import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { askPlantQuestion } from '../../services/geminiService';

// ---- types ----
type ChatItem = { role: 'user' | 'assistant'; content: string };
type ServiceTurn = { role: 'user' | 'model'; content: string };

interface PlantChatModalProps {
  plantName: string;
  visible: boolean;
  onClose: () => void;
}

export default function PlantChatModal({
  plantName,
  visible,
  onClose,
}: PlantChatModalProps) {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [sending, setSending] = useState(false);

  const send = async () => {
    const question = input.trim();
    if (!question || sending) return;

    const nextChat: ChatItem[] = [...chat, { role: 'user', content: question }];
    setChat(nextChat);
    setInput('');
    setSending(true);

    const history: ServiceTurn[] = nextChat.map((c) => ({
      role: c.role === 'assistant' ? 'model' : 'user',
      content: c.content,
    }));

    try {
      const answer = await askPlantQuestion(plantName, question, history);
      setChat([...nextChat, { role: 'assistant', content: answer }]);
    } catch {
      setChat([
        ...nextChat,
        { role: 'assistant', content: 'Error occurred. Try again.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      >
      <SafeAreaView style={styles.modalRoot}>
        {/* -------- header -------- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gemini Chat</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* -------- chat scroll -------- */}
        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={{ padding: 16 }}
        >
          {chat.map((msg, i) => (
            <Text
              key={i}
              style={msg.role === 'user' ? styles.userBubble : styles.botBubble}
            >
              {msg.content}
            </Text>
          ))}
        </ScrollView>

        {/* -------- input row -------- */}
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Ask about this plant..."
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
            editable={!sending}
          />
          <TouchableOpacity style={styles.button} onPress={send} disabled={sending}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, backgroundColor: '#1b4332' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  closeText: { color: '#fff', fontSize: 16 },

  chatArea: { flex: 1 },

  userBubble: {
    alignSelf: 'flex-end',
    color: '#fff',
    marginBottom: 8,
  },
  botBubble: {
    alignSelf: 'flex-start',
    color: '#fff',
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
  },
  button: {
    backgroundColor: '#2d6a4f',
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
