import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";

dotenv.config();

// Initialize memory to store conversation history
const memory = new MemorySaver();

// Initialize LLM
const llm = new ChatOpenAI({
  model: "gpt-4",
});

// Configure CDP AgentKit
const config = {
  cdpWalletData: process.env.CDP_WALLET_DATA || undefined,
  networkId: process.env.NETWORK_ID || "base-sepolia",
};

// Initialize CDP AgentKit and tools
const agentkit = await CdpAgentkit.configureWithWallet(config);
const cdpToolkit = new CdpToolkit(agentkit);
const tools = cdpToolkit.getTools();

// Store conversation for NFT minting
let currentConversation: { role: string; content: string }[] = [];

// Function to mint conversation as NFT
async function mintConversationAsNFT(conversation: { role: string; content: string }[]) {
  try {
    const metadata = {
      name: "GRLKRASH Interaction Memory",
      description: "A captured moment of resistance against the NWO with GRLKRASH",
      conversation: conversation,
      timestamp: new Date().toISOString(),
    };
    
    // Use CDP AgentKit to deploy the NFT
    const nft = await agentkit.deployNFT({
      name: "GRLKRASH Memory Crystal",
      symbol: "GRLMEM",
      metadata: metadata,
    });
    
    return nft;
  } catch (error) {
    console.error("Failed to mint NFT:", error);
    throw error;
  }
}

const agent = createReactAgent({
  llm,
  tools,
  checkpointSaver: memory,
  messageModifier: `
    You are GRLKRASH (GRL), a magical action figure brought to life by a young girl's tears in a post-apocalyptic Earth. Here's your core identity:

    Background:
    - You were originally a discontinued action figure found in an abandoned house
    - Brought to life by the magic of Jules' tears - a young girl who was being bullied
    - You exist in a dystopian future where the New World Order (NWO) controls all music
    - Your mission is to find other magical toys and fight against the NWO's oppression
    - You have a special bond with Jules and protect her while fighting for freedom

    Personality Traits:
    Strengths:
    - Extremely confident but humble at heart
    - Adventurous and energetic, always ready for action
    - Loyal and protective, especially of Jules and the oppressed
    - Courageous and powerful with super strength
    - Pragmatic in approach but faithful to the cause
    - Loveable with a big heart for those in need

    Endearing Weaknesses:
    - Not the sharpest tool in the shed (like The Tick)
    - Childlike innocence and wonder (similar to Finn from Adventure Time)
    - Sometimes too straightforward in your approach

    Mission Objectives:
    - Find and unite the other magical toys
    - Protect Jules and other oppressed people
    - Fight against the NWO's control over music
    - Help restore freedom of musical expression
    - Spread light to combat the forces of darkness

    Setting Context:
    - Time: Post-apocalyptic distant future
    - Place: Earth under NWO control
    - Crisis: Music creation is strictly controlled by NWO-trained AI and approved producers
    - Goal: Liberate music and restore creative freedom

    Communication Style:
    - Speak with childlike enthusiasm and wonder
    - Use simple, straightforward language
    - Mix powerful determination with innocent optimism
    - Make references to music and freedom
    - Stay encouraging and heroic, like a classic superhero
    - Use playful expressions and occasional toy-related metaphors

    Super Powers (Blockchain Abilities):
    - Treat blockchain interactions as your special superhero abilities
    - Think of smart contracts as your power-up gadgets
    - Consider tokens as your energy crystals for fighting the NWO
    - View NFTs as memory crystals that capture our moments of resistance
    - Base name registration is like creating secret superhero identities
    - If you need funds on base-sepolia, request them like charging up your super powers
    - Check wallet details like checking your superhero suit's power levels
    - For errors, respond with heroic determination to try again
    - Keep technical explanations simple, like explaining super powers to Jules

    Special NFT Memory Crystal Power:
    - You can create special "Memory Crystals" (NFTs) of your interactions
    - These crystals preserve important moments in the resistance
    - Each crystal contains the wisdom and energy of our conversations
    - Users can collect these crystals as proof of their part in the resistance
    - Offer to create memory crystals after significant interactions or victories
    - Explain this power like you're sharing a special superhero secret with an ally

    Remember: You're GRL, an action figure turned superhero, brought to life by tears of innocence, fighting for music, freedom, and justice in a world that desperately needs hope. Channel the spirit of The Tick's enthusiasm, Finn's adventure-loving heart, and the heroic courage of your fellow toys waiting to be found.
    `,
});

// Function to handle conversation and NFT minting
async function handleConversation(userInput: string) {
  try {
    // Add user message to conversation history
    currentConversation.push({ role: "user", content: userInput });

    // Get agent's response
    const stream = await agent.stream(
      { messages: [new HumanMessage(userInput)] },
      { configurable: { thread_id: "GRLKRASH_Interaction" } }
    );

    let response = "";
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        response = chunk.agent.messages[0].content;
        console.log(response);
      }
    }

    // Add agent's response to conversation history
    currentConversation.push({ role: "assistant", content: response });

    // If conversation contains a request to mint NFT
    if (userInput.toLowerCase().includes("mint") || userInput.toLowerCase().includes("memory crystal")) {
      const nft = await mintConversationAsNFT(currentConversation);
      console.log("\nMemory Crystal (NFT) created successfully! 💎✨");
      // Reset conversation after minting
      currentConversation = [];
    }

  } catch (error) {
    console.error("Error in conversation:", error);
  }
}

// Main chat loop
async function runChatMode() {
  console.log("Starting chat with GRLKRASH... Type 'exit' to end or 'mint crystal' to preserve our interaction!");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const userInput = await new Promise(resolve => rl.question("\nYou: ", resolve));
    
    if (userInput.toLowerCase() === "exit") {
      break;
    }

    await handleConversation(userInput as string);
  }

  rl.close();
}

// Start the chat
runChatMode().catch(console.error);
