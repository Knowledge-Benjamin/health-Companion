import localforage from 'localforage';

// Configure our local database (mimicking a SQLite/LiteSQL setup for the browser)
localforage.config({
  name: 'SentinelHealthDB',
  version: 1.0,
  storeName: 'health_telemetry_store', // Should be alphanumeric, with underscores.
  description: 'On-device persistent storage for Sentinel Health telemetry and integrations.'
});

// A robust client database service mimicking lightweight SQL operations
export const ClientDatabase = {
  // Save an item to the local database
  async save(table: string, key: string, data: any) {
    try {
      const records = (await localforage.getItem<Record<string, any>>(table)) || {};
      records[key] = { ...data, updatedAt: new Date().toISOString() };
      await localforage.setItem(table, records);
      return true;
    } catch (err) {
      console.error(`DB Save Error [${table}]:`, err);
      return false;
    }
  },

  // Retrieve an item from the local database
  async get(table: string, key: string) {
    try {
      const records = (await localforage.getItem<Record<string, any>>(table)) || {};
      return records[key] || null;
    } catch (err) {
      console.error(`DB Get Error [${table}]:`, err);
      return null;
    }
  },

  // Retrieve all items for a table
  async getAll(table: string) {
    try {
      const records = await localforage.getItem<Record<string, any>>(table);
      return records ? Object.values(records) : [];
    } catch (err) {
      console.error(`DB GetAll Error [${table}]:`, err);
      return [];
    }
  },
  
  // Clear a specific table
  async dropTable(table: string) {
    try {
       await localforage.removeItem(table);
       return true;
    } catch (err) {
       console.error(`DB Drop Error [${table}]:`, err);
       return false;
    }
  }
};
