import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
// import { z } from 'zod';
import {triageAgent} from "./triageAgent"
import {doctorRecommenderAgent} from "./doctorRecommenderAgent"
import {docExplainerAgent} from "./docExplainerAgent"

export const routingAgent = new Agent({
  id: 'routing-agent',
  name: 'Routing Agent',
  instructions: `
    You are the central dispatcher for a healthcare AI system. 
    Analyze the user's message and classify it into one of the following categories:
    - 'triageAgent': For symptoms or feeling unwell.
    - 'docExplainerAgent': For lab reports, X-rays, or medical documents.
    - 'doctorRecommenderAgent': For finding a doctor or specialist.
  `,
  // In v1.1.0, you must use the provider function
  model: 'google/gemini-2.5-flash', 
  
  // Define structured outputs here
  agents:{triageAgent,
    doctorRecommenderAgent,
    docExplainerAgent
  }
});