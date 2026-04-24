'use client';

import React, { useEffect, useRef, useState } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hi! I'm Dhruvik's personal AI assistant. How can I help you today? You can ask about his projects, skills, or when he's available to chat!",
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const readStream = async (
    stream: ReadableStream<Uint8Array>,
    assistantId: string
  ): Promise<string> => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = '';
    let sseBuffer = '';

    const flushSSEBuffer = (buffer: string) => {
      const parts = buffer.split(/\n\n/).filter(Boolean);
      const extracted: string[] = [];

      for (const part of parts) {
        const lines = part.split(/\n/).map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
          if (line === '[DONE]' || line === 'data: [DONE]') continue;
          let payload = line;
          if (payload.startsWith('data:')) payload = payload.replace(/^data:\s*/, '');

          try {
            const parsed = JSON.parse(payload);
            if (typeof parsed === 'string') {
              extracted.push(parsed);
            } else if (parsed?.choices && Array.isArray(parsed.choices)) {
              for (const c of parsed.choices) {
                const d = c?.delta?.content || c?.delta?.text || c?.text || c?.content;
                if (d) extracted.push(d);
              }
            } else {
              const d = parsed?.delta?.content || parsed?.delta?.text || parsed?.text || parsed?.content;
              if (d) extracted.push(d);
            }
          } catch (e) {
            extracted.push(payload);
          }
        }
      }

      return extracted.join('');
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      sseBuffer += chunk;

      const lastDoubleNewline = sseBuffer.lastIndexOf('\n\n');
      let processable = sseBuffer;
      if (lastDoubleNewline !== -1) {
        processable = sseBuffer.slice(0, lastDoubleNewline + 2);
        sseBuffer = sseBuffer.slice(lastDoubleNewline + 2);
      } else {
        if (sseBuffer.length > 1024) {
          processable = sseBuffer;
          sseBuffer = '';
        } else {
          processable = '';
        }
      }

      if (processable) {
        const parsed = flushSSEBuffer(processable);
        if (parsed) {
          text += parsed;
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId ? { ...message, content: text.trim() ? text : 'Typing…' } : message
            )
          );
        }
      }
    }

    if (sseBuffer) {
      const parsed = flushSSEBuffer(sseBuffer);
      if (parsed) {
        text += parsed;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId ? { ...message, content: text.trim() ? text : 'Typing…' } : message
          )
        );
      }
    }

    text += decoder.decode();
    return text;
  };

  const sendMessage = async (text: string) => {
    if (isLoading) return;

    const userMessage: Message = { id: String(Date.now()), role: 'user', content: text };
    const assistantId = `assistant-${Date.now()}`;
    const nextMessages = [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: 'assistant', content: 'Typing…' }]);
    setIsLoading(true);

    try {
      const payload = JSON.stringify({ messages: nextMessages.map((m) => ({ role: m.role, content: m.content })) });
      console.debug('Sending /api/chat payload', { length: payload.length });

      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });

      console.debug('API response', res.status, Array.from(res.headers.entries()));

      if (!res.ok) {
        const errorBody = await res.text();
        let parsedMsg = errorBody;
        try {
          const j = JSON.parse(errorBody);
          parsedMsg = j?.message || j?.error || JSON.stringify(j);
        } catch {}
        console.error('API returned non-ok:', res.status, parsedMsg);
        throw new Error(parsedMsg || 'API error');
      }

      let assistantText = '';

      if (res.body && typeof (res.body as any).getReader === 'function') {
        try {
          assistantText = await readStream(res.body as ReadableStream<Uint8Array>, assistantId);
        } catch (err) {
          console.error('readStream failed, falling back to text():', err);
          assistantText = await res.text();
        }
      } else if (res.body) {
        try {
          assistantText = await new Response(res.body as any).text();
        } catch (err) {
          console.warn('new Response(res.body).text() failed, using res.text()', err);
          assistantText = await res.text();
        }
      } else {
        assistantText = await res.text();
      }

      console.debug('Assistant raw text length:', assistantText?.length);
      if (!assistantText || !assistantText.trim()) console.warn('Assistant response empty - raw content:', assistantText);

      const finalText = assistantText.trim() || 'Sorry, I could not generate a response.';
      setMessages((prev) => prev.map((message) => (message.id === assistantId ? { ...message, content: finalText } : message)));
    } catch (error) {
      console.error('Chat Error:', error);
      const errMsg = (error as any)?.message || 'Sorry, something went wrong. Please try again.';
      setMessages((prev) => prev.map((message) => (message.id === assistantId ? { ...message, content: `Error: ${errMsg}` } : message)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    await sendMessage(trimmed);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-4xl h-[92vh] flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-[0_40px_120px_rgba(15,23,42,0.65)]">
        <div className="px-6 py-5 border-b border-white/10 bg-slate-950/90 backdrop-blur-sm">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400 sm:self-start">
              AI assistant
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">Dhruvik’s AI companion</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
                Ask about his work, availability, education, or contact details.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-5 py-4 text-sm leading-7 shadow-[0_10px_30px_rgba(15,23,42,0.2)] transition-all ${
                    message.role === 'user'
                      ? 'rounded-br-none bg-sky-500 text-white'
                      : 'rounded-bl-none bg-slate-800 text-slate-100 ring-1 ring-white/5'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-w-0 rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              disabled={isLoading}
              aria-label="Type your message"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex h-12 items-center justify-center rounded-full bg-sky-500 px-6 text-sm font-semibold text-white shadow-lg shadow-sky-500/15 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Typing…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
