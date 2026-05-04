export const localApiStorage = {
  async get(key) {
    const response = await fetch(`/api/${key}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load ${key}`);
    }
    const data = await response.json();
    return { value: JSON.stringify(data.value) };
  },

  async set(key, serializedValue) {
    const value = JSON.parse(serializedValue);
    const response = await fetch(`/api/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!response.ok) {
      throw new Error(`Could not save ${key}`);
    }
    return response.json();
  },
};
