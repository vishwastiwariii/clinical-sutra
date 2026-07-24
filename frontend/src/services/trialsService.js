import apiClient from './apiClient.js';
import { normalizeTrial } from '../lib/trials.js';

export const trialsService = {
  /** GET /search → { items, page, limit, total, totalPages } */
  async search({ q = '', page = 1, limit = 10, status = '', phase = '' } = {}, config = {}) {
    const params = { q, page, limit };
    if (status) params.status = status;
    if (phase) params.phase = phase;

    const body = await apiClient.get('/search', { params, ...config });
    const result = body?.result || {};

    return {
      items: (result.results || []).map(normalizeTrial),
      page: result.page ?? page,
      limit: result.limit ?? limit,
      total: result.total ?? 0,
      totalPages: result.totalPages ?? 0,
    };
  },

  /** GET /trials/:nctId → a single normalized trial */
  async getByNctId(nctId, config = {}) {
    const body = await apiClient.get(`/trials/${encodeURIComponent(nctId)}`, config);
    return normalizeTrial(body?.data);
  },
};
