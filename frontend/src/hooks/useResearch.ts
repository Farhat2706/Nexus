import { useState } from 'react';
import { researchAPI } from '../api/apiClient';
import { useAppStore } from '../store/useAppStore';

export const useResearch = () => {
  const { addMessage, setLoading, mode } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  const pollSession = async (sessionId: string): Promise<any> => {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const res = await researchAPI.getSession(sessionId);
        const session = res.data;
        console.log('Poll result:', session.status, session);
        if (session.status === 'done' || session.status === 'completed') {
          return session;
        }
        if (session.status === 'error') {
          throw new Error('Research failed on backend');
        }
      } catch (e: any) {
        if (e.message === 'Research failed on backend') throw e;
        console.log('Polling attempt', i);
      }
    }
    throw new Error('Research timed out');
  };

  const sendQuery = async (query: string) => {
    if (!query.trim()) return;

    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: query,
      sources: [],
      timestamp: new Date(),
    });

    setLoading(true);
    setError(null);

    try {
      const data = await researchAPI.query(query, mode);
      const sessionId = data.data?.sessionId;
      if (!sessionId) throw new Error('No session ID returned');

      const session = await pollSession(sessionId);
      const result = session.result;

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: result?.text || JSON.stringify(result),
        sources: (result?.sources || []).map((s: any) => s.url),
        timestamp: new Date(),
      });

    } catch (err: any) {
      setError(err.message);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '⚠ ' + (err.message || 'Something went wrong'),
        sources: [],
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  return { sendQuery, error };
};