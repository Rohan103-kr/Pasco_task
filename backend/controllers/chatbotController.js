const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { getDbMode } = require('../config/db');

// Helper to get local products from products.json
const getLocalProducts = () => {
  try {
    const productsPath = path.join(__dirname, '..', 'data', 'products.json');
    const rawData = fs.readFileSync(productsPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading local products: ${error.message}`);
    return [];
  }
};

// Retrieve all products from DB or local JSON
const getAllProductsList = async () => {
  try {
    const dbMode = getDbMode();
    if (dbMode === 'mongodb') {
      return await Product.find({});
    } else {
      return getLocalProducts();
    }
  } catch (error) {
    console.error(`Error fetching products for chatbot: ${error.message}`);
    return getLocalProducts(); // Fallback
  }
};

// Simple search/RAG retrieval algorithm
const retrieveRelevantProducts = (allProducts, query) => {
  if (!query) return allProducts.slice(0, 8);

  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (queryTerms.length === 0) return allProducts.slice(0, 8);

  const scored = allProducts.map(product => {
    let score = 0;
    const nameLower = product.name.toLowerCase();
    const descLower = (product.description || '').toLowerCase();
    const rangeLower = (product.rangeType || '').toLowerCase();
    const categoryLower = (product.category || '').toLowerCase();
    const spiceLower = (product.spiciness || '').toLowerCase();
    const dietaryLower = (product.dietary || []).map(d => d.toLowerCase());

    queryTerms.forEach(term => {
      // Direct product name match (highest score)
      if (nameLower.includes(term)) score += 10;
      // Category/Range type match
      if (rangeLower.includes(term) || categoryLower.includes(term)) score += 5;
      // Spiciness or dietary match
      if (spiceLower === term) score += 4;
      if (dietaryLower.includes(term)) score += 4;
      // Description match
      if (descLower.includes(term)) score += 2;
    });

    return { product, score };
  });

  // Filter out zero matches and sort
  const matches = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
  
  if (matches.length === 0) {
    // If no direct matches, return standard default products
    return allProducts.slice(0, 8);
  }

  return matches.slice(0, 8).map(m => m.product);
};

// Main POST controller for Chatbot
const getChatbotResponse = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Fetch products & perform local keyword search/retrieval (RAG)
    const allProducts = await getAllProductsList();
    const matchedProducts = retrieveRelevantProducts(allProducts, message);

    // 2. Format retrieved products as context
    let productsContextText = '';
    matchedProducts.forEach((p, idx) => {
      productsContextText += `${idx + 1}. ${p.name}
   - Product Code: ${p.productCode}
   - Category: ${p.category} (${p.rangeType})
   - Size: ${p.size} jar
   - Spice Level: ${p.spiciness}
   - Dietary: ${(p.dietary || []).join(', ')}
   - Description: ${p.description || 'Authentic Pasco recipe.'}
\n`;
    });

    // 3. System Prompt
    const systemPrompt = `You are the Pasco Foods Virtual Assistant, a friendly and expert culinary AI representing Pasco Foods Limited (established in 1990, UK).
You help customers find products, learn cooking details, match spice levels, and answer dietary questions.

Here is the retrieved set of matching/relevant products from the Pasco Foods catalog:
${productsContextText}

Guidelines:
- Speak warmly, helpfully, and with culinary enthusiasm.
- Recommend products directly from the retrieved context when relevant.
- Cite specific details like product codes, package size (e.g. 350G jar), spiciness level, and dietary labels (Vegetarian, Vegan, Gluten Free, Halal) to be precise and useful.
- Provide pairing tips or recipe suggestions if asked (e.g. suggestion to serve with naan bread, rice, or specific meats/paneer).
- Keep answers relatively concise and highly readable.
- If asked about items or cuisines completely unrelated to Pasco Foods, politely steer the user back to the Pasco Foods catalog and heritage.
`;

    // 4. Retrieve LLM Config from Environment
    const provider = process.env.LLM_PROVIDER || 'ollama';
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
    const geminiKey = process.env.GEMINI_API_KEY;

    console.log(`[Chatbot] Request received. Provider: ${provider}. Model: ${ollamaModel}`);

    // --- OLLAMA PROVIDER ---
    if (provider === 'ollama') {
      try {
        const ollamaHistory = [
          { role: 'system', content: systemPrompt },
          ...history.map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content
          })),
          { role: 'user', content: message }
        ];

        const response = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            messages: ollamaHistory,
            stream: false
          })
        });

        if (response.ok) {
          const data = await response.json();
          const responseText = data.message?.content || '';
          return res.json({
            reply: responseText,
            provider: 'ollama',
            model: ollamaModel,
            retrieved: matchedProducts.map(p => ({ name: p.name, productCode: p.productCode }))
          });
        } else {
          throw new Error(`Ollama returned status code: ${response.status}`);
        }
      } catch (ollamaErr) {
        console.warn(`Ollama call failed or server not running: ${ollamaErr.message}. Attempting fallback...`);
      }
    }

    // --- GEMINI PROVIDER (Alternative / Fallback) ---
    if (geminiKey) {
      try {
        // Map history to Gemini content format
        const contents = [];
        history.forEach(h => {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
          });
        });
        // Add current message
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (responseText) {
            return res.json({
              reply: responseText,
              provider: 'gemini',
              model: 'gemini-1.5-flash',
              retrieved: matchedProducts.map(p => ({ name: p.name, productCode: p.productCode }))
            });
          }
        }
        throw new Error(`Gemini API error status: ${response.status}`);
      } catch (geminiErr) {
        console.warn(`Gemini API call failed: ${geminiErr.message}. Attempting static rules engine...`);
      }
    }

    // --- RULE-BASED SMART FALLBACK ---
    // If Ollama is offline and no Gemini Key is set, generate a smart, responsive helper reply
    const replyText = generateLocalRuleBasedReply(message, matchedProducts);
    return res.json({
      reply: replyText,
      provider: 'local_fallback',
      model: 'smart_keyword_matcher',
      retrieved: matchedProducts.map(p => ({ name: p.name, productCode: p.productCode }))
    });

  } catch (error) {
    console.error(`Error in getChatbotResponse: ${error.message}`);
    return res.status(500).json({ error: 'An error occurred while processing your message' });
  }
};

// Generates a smart fallback reply using keyword matches
const generateLocalRuleBasedReply = (query, matchedProducts) => {
  const queryLower = query.toLowerCase();
  
  let greeting = `👋 Hello! I am the Pasco Foods Virtual Assistant. (Currently running in Local Matcher Mode).\n\n`;
  
  // Specific match: Spiciness / Heat
  if (queryLower.includes('spic') || queryLower.includes('hot') || queryLower.includes('heat') || queryLower.includes('mild')) {
    const list = matchedProducts.map(p => `• **${p.name}** (Code: ${p.productCode}) - Heat: *${p.spiciness.toUpperCase()}*. Description: ${p.description}`).join('\n\n');
    return greeting + `Regarding spiciness, here are some options from our catalog:\n\n${list}\n\nOur products range from 'no heat' to 'very hot' (like our Goanese Vindaloo!). You can also use our **Taste Matcher / Spice Finder Wizard** in the catalog section to discover your perfect heat range.`;
  }

  // Specific match: Dietary requirements
  if (queryLower.includes('gluten') || queryLower.includes('vegan') || queryLower.includes('vegetarian') || queryLower.includes('halal')) {
    const list = matchedProducts.map(p => `• **${p.name}** (Code: ${p.productCode}) - Certification: *${(p.dietary || []).join(', ')}*`).join('\n');
    return greeting + `All of our products are prepared to the highest standard. Here is the dietary info for the relevant products:\n\n${list}\n\nMost of our range is Gluten-Free and Vegetarian certified. Let me know if you need details on a specific recipe!`;
  }

  // Specific match: Recipes or cooking instructions
  if (queryLower.includes('cook') || queryLower.includes('recipe') || queryLower.includes('pair') || queryLower.includes('serve') || queryLower.includes('chicken') || queryLower.includes('meat')) {
    const list = matchedProducts.map(p => `• **${p.name}** (Code: ${p.productCode}) - Great with paneer, vegetables, chicken, or lamb.`).join('\n');
    return greeting + `For cooking and preparation, our sauces and pastes are extremely versatile:\n\n${list}\n\n**To cook:** simply fry your choice of protein or vegetables, pour in the Pasco Cooking Sauce (or stir in our Paste with coconut milk/tomatoes), and simmer for 15-20 minutes until thoroughly cooked. Serve hot with basmati rice or fresh naan!`;
  }

  // Default listing
  const list = matchedProducts.map(p => `• **${p.name}** (Code: ${p.productCode}) - ${p.description}`).join('\n');
  return greeting + `I did a quick scan of the Pasco Foods catalog based on your question. Here are some products you might like:\n\n${list}\n\nHow else can I assist you with our authentic Indian range?`;
};

module.exports = {
  getChatbotResponse
};
