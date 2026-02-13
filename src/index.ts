import { mastra } from './mastra';
import * as readline from 'readline';

// Simple CLI to demonstrate the multi-agent system
async function startChat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const triageAgent = mastra.getAgent('triageAgent');
  const doctorAgent = mastra.getAgent('doctorRecommenderAgent');
  const explainerAgent = mastra.getAgent('docExplainerAgent');

  console.log("--- MediBot Healthcare Assistant ---");
  console.log("1. Symptom Triage");
  console.log("2. Document Explainer");
  console.log("3. Find a Doctor");
  
  rl.question('Select mode (1/2/3): ', async (mode) => {
    let activeAgent;
    
    if (mode === '1') activeAgent = triageAgent;
    else if (mode === '2') activeAgent = explainerAgent;
    else if (mode === '3') activeAgent = doctorAgent;
    else {
        console.log("Invalid mode.");
        rl.close();
        return;
    }

    console.log(`\nStarted session with ${activeAgent?.name}. Type 'exit' to quit.\n`);

    const messages: Array<{role: string, content: string}> = [];

    const chatLoop = () => {
        rl.question('You: ', async (input) => {
            if (input.toLowerCase() === 'exit') {
                rl.close();
                process.exit(0);
            }

            try {
                // Manage session memory locally for this CLI
                messages.push({ role: 'user', content: input });
                
                // Construct a prompt with history
                // In a full Mastra deployment with @mastra/memory, you would pass a threadId
                const contextPrompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

                const response = await activeAgent?.generate(contextPrompt);
                
                const responseText = response?.text || "I'm having trouble thinking right now.";
                messages.push({ role: 'assistant', content: responseText });

                console.log(`\n${activeAgent?.name}: ${responseText}\n`);
                
                // Simple logic to switch to doctor recommendation if triage suggests it
                if (mode === '1' && responseText.toLowerCase().includes("recommend a doctor")) {
                     console.log("[System]: It seems you might need a doctor. Switching to Doctor Recommender...");
                     activeAgent = doctorAgent;
                     // We clear context or keep it depending on desired behavior. 
                     // For switching context completely, we might want to summarize, but here we just keep going.
                }

            } catch (error) {
                console.error("Error:", error);
            }
            
            chatLoop();
        });
    };

    chatLoop();
  });
}

startChat();
