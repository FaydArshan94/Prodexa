const { StateGraph, MessagesAnnotation } = require("@langchain/langgraph")
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai")
const { ToolMessage, AIMessage, HumanMessage } = require("@langchain/core/messages")
const tools = require("./tools")    

// Aggressive caching for free tier quota management
const responseCache = new Map();
const MAX_CACHE_SIZE = 100;
let requestQueue = [];
let isProcessing = false;
const REQUEST_DELAY = 2000; // 2 seconds between requests to avoid rate limit

const getCacheKey = (message) => {
    if (message && typeof message === 'string') {
        // Simple hash of the message
        return `msg_${message.toLowerCase().trim().substring(0, 150)}`;
    }
    return null;
};

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash", // Using older, more stable model with better free tier support
    temperature: 0.7,
    apiKey: process.env.GOOGLE_API_KEY,
    timeout: 30000,
    maxRetries: 0, // Disable retries to avoid hitting quota faster
})


const graph = new StateGraph(MessagesAnnotation)
    .addNode("tools", async (state, config) => {

        const lastMessage = state.messages[ state.messages.length - 1 ]

        const toolsCall = lastMessage.tool_calls || [];
        
        if (!toolsCall || toolsCall.length === 0) {
            console.log("⚠️ No tool calls in last message");
            return state;
        }

        const toolCallResults = await Promise.all(toolsCall.map(async (call) => {

            const tool = tools[ call.name ]
            if (!tool) {
                console.error(`❌ Tool ${call.name} not found`)
                return new ToolMessage({ 
                    content: `Tool ${call.name} not found`, 
                    name: call.name,
                    tool_call_id: call.id
                })
            }
            
            try {
                const toolInput = call.args || {}

                console.log("🔧 Invoking tool:", call.name, "with input:", toolInput)

                // LangChain tools have a .invoke method
                const toolResult = await tool.invoke({ ...toolInput, token: config?.metadata?.token })

                return new ToolMessage({ 
                    content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult), 
                    name: call.name,
                    tool_call_id: call.id
                })
            } catch (error) {
                console.error(`❌ Tool error for ${call.name}:`, error.message)
                return new ToolMessage({
                    content: `Error: ${error.message}`,
                    name: call.name,
                    tool_call_id: call.id
                })
            }

        }))

        state.messages.push(...toolCallResults)

        return state
    })
    .addNode("chat", async (state, config) => {
        try {
            const lastHumanMsg = state.messages.find(m => m instanceof HumanMessage);
            const userMessage = lastHumanMsg?.content || "";
            
            console.log("💬 Processing:", userMessage.substring(0, 50) + "...");
            
            // Check cache FIRST
            const cacheKey = getCacheKey(userMessage);
            if (cacheKey && responseCache.has(cacheKey)) {
                console.log("⚡ Cache HIT - Using saved response");
                const { content, toolCalls } = responseCache.get(cacheKey);
                state.messages.push(new AIMessage({ content, tool_calls: toolCalls }));
                return state;
            }
            
            console.log("❌ Cache MISS - Calling API (limited to 60 calls/day free tier)");
            
            // Rate limiting for free tier
            await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
            
            const response = await model.invoke(state.messages, { 
                tools: [ tools.searchProduct, tools.addProductToCart ] 
            });

            const content = response.content || "";
            const toolCalls = response.tool_calls || [];

            console.log("✅ API response received");
            console.log("📝 Content length:", content.length);
            console.log("🔧 Tool calls:", toolCalls.length);

            // Cache the response
            if (cacheKey && responseCache.size < MAX_CACHE_SIZE) {
                responseCache.set(cacheKey, { content, toolCalls });
                console.log("💾 Cached for next time");
            }

            state.messages.push(new AIMessage({ content, tool_calls: toolCalls }));
            return state;
            
        } catch (error) {
            console.error("❌ Error:", error.message);
            
            // Quota error handling
            if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("Quota")) {
                console.error("⚠️ QUOTA EXCEEDED - Free tier limit reached");
                const message = "🚫 Free tier quota exceeded (60 requests/day). Please try:\n" +
                    "1. Add billing to your Google Cloud project for higher limits\n" +
                    "2. Wait until tomorrow for quota reset\n" +
                    "3. Create a new Google Cloud project with fresh API key\n" +
                    "4. Use cached responses for common questions";
                
                state.messages.push(new AIMessage({ content: message, tool_calls: [] }));
                return state;
            }
            
            state.messages.push(new AIMessage({ 
                content: `Error: ${error.message}`, 
                tool_calls: [] 
            }));
            return state;
        }
    })
    .addEdge("__start__", "chat")
    .addConditionalEdges("chat", (state) => {

        const lastMessage = state.messages[ state.messages.length - 1 ]

        if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            console.log("➡️ Routing to tools for", lastMessage.tool_calls.length, "tool calls")
            return "tools"
        } else {
            console.log("✔️ Routing to end")
            return "__end__"
        }

    })
    .addEdge("tools", "chat")



const agent = graph.compile()


module.exports = agent






