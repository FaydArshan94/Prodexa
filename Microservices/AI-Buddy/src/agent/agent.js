const { StateGraph, MessagesAnnotation } = require("@langchain/langgraph")
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai")
const { ToolMessage, AIMessage, HumanMessage } = require("@langchain/core/messages")
const tools = require("./tools")    


const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.7,
    apiKey: process.env.GOOGLE_API_KEY,
    timeout: 60000,
    maxRetries: 2,
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
            console.log("💬 Invoking model with", state.messages.length, "messages");
            
            const response = await model.invoke(state.messages, { 
                tools: [ tools.searchProduct, tools.addProductToCart ] 
            })

            console.log("✅ Model response received");

            // Handle both AI message response and content
            const content = response.content || response.text || "";
            const toolCalls = response.tool_calls || [];

            console.log("📝 Content length:", content.length);
            console.log("🔧 Tool calls:", toolCalls.length);

            state.messages.push(new AIMessage({ content: content, tool_calls: toolCalls }))

            return state
        } catch (error) {
            console.error("❌ Model invocation error:", error.message, error.cause);
            throw error;
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






