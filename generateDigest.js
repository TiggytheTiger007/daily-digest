import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper function to fetch specific categories cleanly
async function fetchNewsCategory(searchQuery, count = 5) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&language=en&sortBy=publishedAt&pageSize=${count}&apiKey=${process.env.NEWS_API_KEY}`;
    try {
        const response = await axios.get(url);
        return response.data.articles.map(article => ({
            title: article.title,
            content: article.description || article.content || "",
            url: article.url
        }));
    } catch (error) {
        console.error(`Error fetching ${searchQuery}:`, error.message);
        return [];
    }
}

async function fetchInternships() {
    console.log("Fetching live internships from GitHub...");
    const url = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md';
    try {
        const response = await axios.get(url);
        const text = response.data;
        const sweHeader = "## 💻 Software Engineering Internship Roles";
        const startIndex = text.indexOf(sweHeader);
        if (startIndex === -1) return "Could not locate the SWE table.";
        return text.substring(startIndex, startIndex + 4000);
    } catch (error) {
        console.error("GitHub Fetch Error:", error.message);
        return "Failed to fetch internships.";
    }
}

app.post('/api/digest', async (req, res) => {
    console.log("\nIncoming request! Compiling balanced data streams...");

    try {
        // 1. Fetch each category separately so they NEVER drown each other out
        const [globalNews, sportsNews, marketNews, githubInternships] = await Promise.all([
            fetchNewsCategory('"world news" OR "breaking news"', 5),
            fetchNewsCategory('"Tennis" OR "MLB" OR "NBA" OR "World Cup"', 8), // Explicitly keeping Tennis in the mix!
            fetchNewsCategory('"Stock Market" OR "S&P 500" OR "Nasdaq"', 5),
            fetchInternships()
        ]);

        // 2. Build the structured prompt mapping the exact data streams
        const prompt = `
        You are a highly analytical morning briefing assistant. Review the following raw data streams:
        
        STREAM 1: GLOBAL BREAKING NEWS
        ${JSON.stringify(globalNews)}

        STREAM 2: SPORTS UPDATES (Tennis, MLB, NBA, World Cup)
        ${JSON.stringify(sportsNews)}

        STREAM 3: FINANCIAL MARKETS
        ${JSON.stringify(marketNews)}

        STREAM 4: GITHUB INTERNSHIP TRACKER
        ${githubInternships}

        Synthesize a dense, data-rich morning digest tailored for an undergraduate student.
        CRITICAL: If a source provides a URL, YOU MUST include it in the 'url' field.

        Sections to generate:
        1. "Top News" (layout: "bullets") - 3 to 5 high-impact global headlines STRICTLY from Stream 1.
        2. "Internships (Top Tier & Sophomore)" (layout: "links") - Extract 3 to 5 active software engineering roles from Stream 4. Prioritize big tech (Google, Microsoft, Meta, etc.) and sophomore-friendly roles. Include application links.
        3. "Sports Desk" (layout: "bullets") - Synthesize major updates from Stream 2. Ensure you provide a balanced recap that includes Tennis alongside other active sports headlines.
        4. "Markets" (layout: "metrics") - Provide a quick summary of index movements or financial sentiment from Stream 3.

        Keep the tone sharp, clean, and operational.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING },
                        sections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    layout: { type: Type.STRING },
                                    items: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                primaryText: { type: Type.STRING },
                                                secondaryText: { type: Type.STRING },
                                                url: { type: Type.STRING }
                                            },
                                            required: ["primaryText", "secondaryText"]
                                        }
                                    },
                                    footerNote: { type: Type.STRING }
                                },
                                required: ["title", "layout", "items"]
                            }
                        }
                    },
                    required: ["date", "sections"]
                }
            }
        });

        res.json(JSON.parse(response.text));

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to generate digest" });
    }
});

app.listen(port, () => console.log(`🚀 Balanced Live Backend running at http://localhost:${port}`));