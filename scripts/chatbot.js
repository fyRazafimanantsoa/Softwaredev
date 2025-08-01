document.addEventListener('DOMContentLoaded', () => {
    // UI Element References
    const chatbotToggler = document.getElementById('chatbot-toggler');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatbotBtn = document.getElementById('close-chatbot');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatbox = document.getElementById('chatbox');

    // LM Studio API Endpoint
    const LM_STUDIO_API_URL = 'http://192.168.227.248:1233/v1/chat/completions';

    // Constants for AI Context Management
    const MAX_CONTEXT_LENGTH = 8000; // Max characters to send to AI (adjust based on your model's token limit)
    let userMessage = null; // Stores the current user message

    /**
     * Creates a new chat list item (<li>) for displaying messages.
     * @param {string} message - The text message to display.
     * @param {string} className - 'incoming' for AI, 'outgoing' for user.
     * @returns {HTMLElement} The created <li> element.
     */
    const createChatLi = (message, className) => {
        const chatLi = document.createElement('li');
        chatLi.classList.add('chat', className);
        chatLi.innerHTML = `<p>${message}</p>`;
        return chatLi;
    };

    /**
     * Extracts readable text content from the main section of the webpage.
     * Prioritizes the <main> element if available, otherwise falls back to the body.
     * @returns {string} The extracted text content.
     */
    const extractPageContent = () => {
        let content = '';
        const mainElement = document.querySelector('main'); // Target the main content area

        if (mainElement) {
            // Get text from common text-containing elements within <main>
            const textElements = mainElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, div');
            textElements.forEach(el => {
                // Simple check for visible elements to avoid hidden text (e.g., from styling)
                if (el.offsetWidth > 0 || el.offsetHeight > 0) {
                    const text = el.innerText.trim();
                    if (text.length > 0) {
                        content += text + '\n'; // Add text and a newline for separation
                    }
                }
            });
        } else {
            // Fallback to body text if no main element (less precise, might include navigation etc.)
            content = document.body.innerText;
        }

        // Basic clean-up: remove excessive whitespace and leading/trailing newlines
        content = content.replace(/\s+/g, ' ').trim();
        return content;
    };

    /**
     * Truncates text to a maximum character length.
     * @param {string} text - The original text.
     * @param {number} maxLength - The maximum desired length.
     * @returns {string} The truncated text.
     */
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '... [Content truncated]';
    };

    /**
     * Sends the user's message and webpage content to the AI and displays the response.
     * @param {HTMLElement} incomingChatLi - The <li> element for the incoming message, used to update 'Thinking...'.
     */
    const generateResponse = async (incomingChatLi) => {
        const messageElement = incomingChatLi.querySelector('p');
        messageElement.textContent = 'Thinking...'; // Indicate that AI is processing

        // Extract and truncate webpage content
        const pageContent = truncateText(extractPageContent(), MAX_CONTEXT_LENGTH);

        // Construct the full prompt for the AI, including webpage content and user question
        const fullPrompt = `You are an AI assistant designed to help customers by answering questions strictly based on the provided webpage content.
If the answer is not explicitly available in the content, please state that you cannot find the information within the provided text.

Webpage Content:
---
${pageContent}
---

User Question: ${userMessage}`; // userMessage is captured from handleChat

        // Prepare messages array for the AI API call
        const messagesToSend = [{"role": "user", "content": fullPrompt}];

        try {
            const response = await fetch(LM_STUDIO_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "model": "local-model", // IMPORTANT: Change this to your specific model ID from LM Studio if "local-model" doesn't work. E.g., "llama-2-7b-chat.Q4_K_M.gguf"
                    "messages": messagesToSend, // Send the constructed prompt
                    "temperature": 0.7, // Adjust creativity (0.0-1.0)
                    "max_tokens": 300, // Max tokens for AI's response. Increase if answers are too short.
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content.trim();
            messageElement.textContent = aiResponse; // Update with AI's actual response
        } catch (error) {
            console.error('Error fetching AI response:', error);
            messageElement.classList.add('error');
            messageElement.textContent = `Oops! Something went wrong. Please try again. (${error.message})`;
        } finally {
            // Ensure chatbox always scrolls to the bottom after a response (or error)
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }
    };

    /**
     * Handles sending the user's chat message.
     */
    const handleChat = () => {
        userMessage = chatInput.value.trim(); // Get user's message
        if (!userMessage) return; // Don't send empty messages

        chatInput.value = ''; // Clear the input field

        // Append user's message to chatbox
        chatbox.appendChild(createChatLi(userMessage, 'outgoing'));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        // Append a placeholder for AI's response (e.g., "Thinking...")
        const incomingChatLi = createChatLi('Thinking...', 'incoming');
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        // Generate AI response
        generateResponse(incomingChatLi);
    };

    // --- Event Listeners ---
    // Toggle chatbot visibility when the main button is clicked
    chatbotToggler.addEventListener('click', () => {
        chatbotContainer.classList.add('show-chatbot'); // Always adds the class to show chatbox
        if (chatbotContainer.classList.contains('show-chatbot')) {
            chatInput.focus(); // Focus on input field when chatbox opens
        }
    });

    // Close chatbot when the 'X' button is clicked
    closeChatbotBtn.addEventListener('click', () => {
        chatbotContainer.classList.remove('show-chatbot'); // Removes class to hide chatbox
    });

    // Send message when the send button is clicked
    sendBtn.addEventListener('click', handleChat);

    // Send message when Enter key is pressed in the input field (without Shift)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent new line in input field
            handleChat();
        }
    });
});