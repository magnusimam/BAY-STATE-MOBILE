import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { PageHeader } from '@/components/PageHeader';
import {
  spacing,
  radius,
  background,
  brand,
  textColor,
  borderColor,
  semantic,
} from '@/constants/Tokens';
import { Text } from '@/components/ui/Text';
import { LivePulse } from '@/components/ui/LivePulse';
import { api } from '@/lib/api';
import { respondTo } from '@/lib/ai-responses';
import type { MasterRow } from '@/lib/api-types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: number;
}

const EXAMPLES = [
  'Give me an executive summary',
  'Top 5 improvers',
  'Flag any anomalies',
  'Displacement in 2025',
  'Compare Borno vs Yobe',
];

export default function AiChatScreen() {
  const [rows, setRows] = useState<MasterRow[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      text: "Hi — I'm **HUMAID AI**, grounded in live BAY States data.\n\nAsk me about displacement, conflict, literacy, youth unemployment, SMEs, or compare states. Try one of the examples below.",
      ts: Date.now(),
    },
  ]);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    api
      .getMaster()
      .then((r) => setRows(r.data || []))
      .catch(() => {});
  }, []);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    const user: Message = { id: `u-${Date.now()}`, role: 'user', text: q, ts: Date.now() };
    setMessages((m) => [...m, user]);
    setInput('');
    setThinking(true);
    Haptics.selectionAsync().catch(() => {});

    // Simulate thinking time so it doesn't feel instant (more credible)
    const delay = 650 + Math.random() * 700;
    setTimeout(() => {
      const answer = respondTo(q, rows);
      const assistant: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: answer,
        ts: Date.now(),
      };
      setMessages((m) => [...m, assistant]);
      setThinking(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }, delay);
  };

  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages, thinking]);

  return (
    <View style={styles.container}>
      <PageHeader
        title="AI Analysis"
        subtitle={`${rows.length} data points loaded`}
        right={<LivePulse label="" size={8} />}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListFooterComponent={
            thinking ? (
              <View style={[styles.bubble, styles.aiBubble, { flexDirection: 'row', gap: 8, alignItems: 'center' }]}>
                <ActivityIndicator size="small" color={brand.amber} />
                <Text variant="caption" color="tertiary">Thinking…</Text>
              </View>
            ) : null
          }
        />

        {messages.length <= 1 ? (
          <View style={styles.examplesWrap}>
            <Text variant="overline" color="tertiary" style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
              Try asking
            </Text>
            <View style={styles.examplesRow}>
              {EXAMPLES.map((ex) => (
                <Pressable
                  key={ex}
                  onPress={() => send(ex)}
                  style={({ pressed }) => [styles.examplePill, pressed && { opacity: 0.7 }]}
                >
                  <Text variant="caption" style={{ color: brand.amber }}>{ex}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about BAY States data…"
            placeholderTextColor={textColor.muted}
            style={styles.input}
            multiline
            maxLength={500}
            onSubmitEditing={() => send(input)}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={() => send(input)}
            disabled={!input.trim() || thinking}
            style={({ pressed }) => [
              styles.sendBtn,
              (!input.trim() || thinking) && { opacity: 0.4 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <LinearGradient
              colors={[brand.amberLight, brand.amber]}
              style={StyleSheet.absoluteFill}
            />
            <FontAwesome name="arrow-up" size={18} color="#1a1205" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  // Basic markdown-ish bold: **text** -> bold segment. Simple splitter.
  const parts = message.text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
      {!isUser ? (
        <View style={styles.aiTag}>
          <FontAwesome name="magic" size={10} color={brand.amber} />
          <Text variant="overline" style={{ color: brand.amber, marginLeft: 4 }}>HUMAID AI</Text>
        </View>
      ) : null}
      <Text variant="body" style={{ color: isUser ? '#1a1205' : textColor.primary, lineHeight: 21 }}>
        {parts.map((p, i) =>
          p.startsWith('**') && p.endsWith('**') ? (
            <Text
              key={i}
              variant="body"
              style={{
                color: isUser ? '#1a1205' : textColor.primary,
                fontWeight: '700',
              }}
            >
              {p.slice(2, -2)}
            </Text>
          ) : (
            p
          ),
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  messages: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  bubble: {
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: '88%',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: background.secondary,
    borderWidth: 1,
    borderColor: borderColor.subtle,
    borderTopLeftRadius: radius.sm,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: brand.amber,
    borderTopRightRadius: radius.sm,
  },
  examplesWrap: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: borderColor.subtle,
  },
  examplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  examplePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: brand.amberBg,
    borderWidth: 1,
    borderColor: brand.amberBorder,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: borderColor.subtle,
    backgroundColor: background.primary,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: background.secondary,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: textColor.primary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: borderColor.default,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
