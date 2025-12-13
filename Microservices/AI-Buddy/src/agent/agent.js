const { StateGraph, MessagesAnnotation } = require("@langchain/langgraph")
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai")
const { ToolMessage, AIMessage, HumanMessage } = require("@langchain/core/messages")
const tools = require("./tools")    


const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.5,
    apiKey: process.env.GOOGLE_API_KEY,
})


const graph = new StateGraph(MessagesAnnotation)
    .addNode("tools", async (state, config) => {

        const lastMessage = state.messages[ state.messages.length - 1 ]

        const toolsCall = lastMessage.tool_calls

        const toolCallResults = await Promise.all(toolsCall.map(async (call) => {

            const tool = tools[ call.name ]
            if (!tool) {
                throw new Error(`Tool ${call.name} not found`)
            }
            const toolInput = call.args

            console.log("Invoking tool:", call.name, "with input:", toolInput)

            // LangChain tools have a .invoke method, not .func
            const toolResult = await tool.invoke({ ...toolInput, token: config.metadata.token })

            return new ToolMessage({ content: JSON.stringify(toolResult), name: call.name })

        }))

        state.messages.push(...toolCallResults)

        return state
    })
    .addNode("chat", async (state, config) => {
        try {
            console.log("🔄 Invoking model with messages:", state.messages);
            
            const response = await model.invoke(state.messages, { 
                tools: [ tools.searchProduct, tools.addProductToCart ] 
            })

            console.log("🤖 Model response:", response);

            // Handle both AI message response and content
            const content = response.content || response.text || "";
            const toolCalls = response.tool_calls || [];

            if (!content && !toolCalls.length) {
                console.warn("⚠️ Model returned empty response");
            }

            state.messages.push(new AIMessage({ content: content, tool_calls: toolCalls }))

            return state
        } catch (error) {
            console.error("❌ Model invocation error:", error.message);
            throw error;
        }

    })
    .addEdge("__start__", "chat")
    .addConditionalEdges("chat", async (state) => {

        const lastMessage = state.messages[ state.messages.length - 1 ]

        if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            return "tools"
        } else {
            return "__end__"
        }

    })
    .addEdge("tools", "chat")



const agent = graph.compile()


module.exports = agent






