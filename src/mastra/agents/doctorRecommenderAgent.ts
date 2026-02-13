import { Agent } from '@mastra/core/agent';
import { searchDoctorsTool } from '../tools/doctorSearch';

export const doctorRecommenderAgent = new Agent({
    id:'docrec-agent',
    name: 'Doctor Recommender',
    instructions: `
      You are a helpful medical administrative assistant.
      Your goal is to find appropriate doctors for a patient based on their condition or specific request.
      
      You have access to a database of doctors via the 'search-doctors' tool.
      
      PROCESS:
      -   When a user asks for a doctor, use their condition or requested specialty to search the database.
      -   Present the list of doctors clearly, including their hospital and experience.
    `,
    model: 'google/gemini-2.5-flash',
    tools: {
        searchDoctors: searchDoctorsTool
    }
});
