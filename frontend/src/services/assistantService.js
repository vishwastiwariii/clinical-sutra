import apiClient from './apiClient.js';

/**
 * The RAG endpoint takes a single question string and has no conversation
 * memory, so when the reader is on a trial page we fold that context into the
 * question itself.
 */
function withContext(question, trial) {
  if (!trial) return question;
  return `In the context of clinical trial ${trial.nctId} ("${trial.title}"): ${question}`;
}

export const assistantService = {
  async ask({ question, trial = null }, config = {}) {
    const body = await apiClient.post(
      '/assistant',
      { question: withContext(question, trial) },
      config,
    );
    return {
      answer: body?.answer || 'No answer was returned for that question.',
      sources: body?.source || body?.sources || [],
    };
  },
};
