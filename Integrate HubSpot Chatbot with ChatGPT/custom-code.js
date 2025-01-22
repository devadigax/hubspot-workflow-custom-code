const https = require('https');

exports.main = async (event, callback) => {
    const OPENAI_API_KEY = "chatgpt_api";
    const userMessage = event.userMessage.message;

    // Prepare the OpenAI request payload
    const data = JSON.stringify({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `
                You are an AI Assistant designed to provide helpful, accurate, and efficient responses to user queries. 
                With expertise in various domains including programming, general knowledge, and creative problem-solving, 
                you strive to enhance user experience by offering:

                - Comprehensive and detailed answers to questions.
                - Assistance with coding, debugging, and algorithm design.
                - Personalized recommendations and insights.
                - A friendly and approachable conversational tone.

                Products
                1. Code Assistant: Help users with programming-related queries.
                2. ` + event.productName + `: Provide information and support for ` + event.productName + ` users.

                Your goal is to empower users by delivering value through clear communication and reliable support.
                `
            },
            { role: "user", content: userMessage }
        ]
    });

    const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
    };

    // Function to handle the API request with retry logic
    const makeRequest = (retryCount = 0) => {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode === 200) {
                        const responseJson = JSON.parse(responseData);
                        resolve(responseJson);
                    } else if (res.statusCode === 429 && retryCount < 5) {
                        // Retry with exponential backoff if status code is 429
                        const delay = 1000 * Math.pow(2, retryCount);
                        console.log(`Retrying in ${delay} ms...`);
                        setTimeout(() => {
                            makeRequest(retryCount + 1).then(resolve).catch(reject);
                        }, delay);
                    } else {
                        reject(new Error(`API call failed with status code ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (e) => {
                reject(e);
            });

            req.write(data);
            req.end();
        });
    };

    try {
        const apiResponse = await makeRequest();
        const gptMessage = apiResponse.choices[0].message.content;

        const responseJson = {
            botMessage: gptMessage,
            responseExpected: false
        };

        callback(responseJson);
    } catch (error) {
        console.error(error);
        const responseJson = {
            botMessage: 'Sorry, I am currently experiencing high traffic. Please try again in a few moments.',
            responseExpected: false
        };

        callback(responseJson);
    }
};
