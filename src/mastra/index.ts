import { Mastra } from '@mastra/core';
import { PostgresStore } from '@mastra/pg';
import { mediBotAgent } from './agents/mediBotAgent';

export const mastra = new Mastra({
  agents: {
    mediBotAgent,
  },
  storage: new PostgresStore({
    id: 'medibot-storage',
    connectionString: process.env.POSTGRES_CONNECTION_STRING!,
  }),
});