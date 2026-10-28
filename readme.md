The Inspector is a testing tool, like Postman for MCP servers. It acts as a simple MCP client in the browser: it connects to your server, lists your tools, lets you fill in the inputs and call them, and shows the raw request and response. That means you can check that your server works before involving Claude.

for installing and running inspector tool used this command
npx @modelcontextprotocol/inspector npx tsx src/index.ts 

you can also add tool manually if you only run this command @modelcontextprotocol/inspector

***Resources***: “give the AI this information”

A resource is data the AI can read as background context. It doesn’t compute anything. It just supplies it.

Example. A user asks: “Can I return the necklace if she doesn’t like it?”

Without a resource: the AI guesses, or says “I don’t know your return policy”. This is the policy hallucination problem.
With a resource: the app attaches store://policies, the AI reads “7-day return window on unworn items”, and it answers correctly.

Use a resource when the information is:

fixed or slow-changing (policies, size charts, FAQs, brand guidelines, catalog documents)
something you’d want attached to many conversations
not an action

product://NK-001 works the same way for one product’s full details.

Tool or resource? If the AI needs to do something or look something up with a parameter, use a tool. If you’re just providing a document to read, use a resource. You could make policies a tool, but then the AI has to guess it should call it, whereas a resource lets the user or app attach it deliberately.

***Prompts***: “start this task the right way”

A prompt is a saved instruction template with blanks. Without it, every user has to write their own instruction and may forget important parts.

Example. The store owner wants every gift request handled consistently:

check stock before recommending anything
mention the return policy
offer exactly 2 options

Instead of hoping each user types that, you ship the gift-finder prompt. The user picks Gift Finder, fills in occasion = birthday and budget = 2000, and the client sends the full instruction to the AI. It’s like a slash command (/gift-finder), a button that starts a well-written conversation.

Use a prompt when:

you have a task people repeat
the quality of the result depends on a good instruction
you want to encode your expertise (“this is the correct way to handle a refund request”)
All three working together

A user opens Claude and picks the Gift Finder prompt (birthday, ₹2,000). The client attaches the policies resource. The AI then uses the tools search_products and check_stock and replies: “Here are two options in stock. Returns are accepted within 7 days.”

The prompt told the AI what to do.
The resource gave it the rules.
The tools let it act.
Future examples in your own project
Resource: a size or care guide, the full product catalog export, a store’s brand voice document
Prompt: “Weekly store review” for the owner, “Handle a return request”, “Write a product description in our brand style”
Tool: get_order_status, create_checkout, update_stock
The honest caveat

Not all clients support resources and prompts equally. Tools are supported nearly everywhere, but resources and prompts depend on the client’s interface, and some only show them in a menu. That’s why most real-world servers lean heavily on tools. Still, you should understand all three, and they matter most in products where the user is in control of the conversation.