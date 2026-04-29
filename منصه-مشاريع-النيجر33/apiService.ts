// @ts-ignore
const API_BASE_URL = (typeof window !== 'undefined' && window.ENV?.API_URL) ? window.ENV.API_URL : (import.meta.env.VITE_API_URL || '');

export const api = {
  async get(entity: string) {
    const res = await fetch(`${API_BASE_URL}/api/${entity}`);
    if (!res.ok) throw new Error(`Failed to fetch ${entity}`);
    return res.json();
  },
  async save(entity: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/api/${entity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to save ${entity}`);
    return res.json();
  },
  async delete(entity: string, id: string) {
    const res = await fetch(`${API_BASE_URL}/api/${entity}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete ${entity}`);
    return res.json();
  },
  async bulkSave(entity: string, data: any[]) {
    const res = await fetch(`${API_BASE_URL}/api/bulk/${entity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Bulk save ${entity} failed:`, errText);
      throw new Error(`Failed to bulk save ${entity}: ${errText}`);
    }
    return res.json();
  }
};
