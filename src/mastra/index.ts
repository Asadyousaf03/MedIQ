import { Mastra } from '@mastra/core';
import { triageAgent } from './agents/triageAgent';
import { docExplainerAgent } from './agents/docExplainerAgent';
import { doctorRecommenderAgent } from './agents/doctorRecommenderAgent';
import { routingAgent } from './agents/routingAgent';

export const mastra = new Mastra({
  agents: {
    routingAgent,
    triageAgent,
    docExplainerAgent,
    doctorRecommenderAgent
  }
});