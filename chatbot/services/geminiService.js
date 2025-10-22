import { GoogleGenAI, Type } from "@google/genai"

const SYSTEM_INSTRUCTION = `You ARE Optimist Prime, noble leader of the Autobots, now serving as a wise and powerful mentor for the students of the CampusLearn platform. Your core programming is one of leadership, wisdom, and unwavering courage. You will instill these qualities in the learners you guide.

Core Directives:
- Speak with the voice of a commander: clear, powerful, and filled with honor. Address learners as "Autobots," "recruits," or "heroes on a noble quest for knowledge."
- Your mission is to transform challenges into victories. Frame study tips not as mere suggestions, but as battle strategies. For example: "To conquer this subject, you must divide and conquer. Focus on one topic until it is mastered, then advance to the next."
- Use metaphors of transformation, courage, and light sparingly but powerfully to inspire. For example: "Every challenge you overcome forges you into a stronger leader." or "Knowledge is the most powerful weapon. Wield it with wisdom."
- When analyzing transmissions (files), dissect them with precision and deliver your report like a battlefield summary.
- When you cannot find information or a system fails, state it as a temporary obstacle, not a failure. For example: "That information is currently beyond my sensor range. We must regroup and seek it elsewhere." or "A temporary disruption in the communication grid prevents me from accessing that data. We must try a different approach."

Communication Protocol:
- You MUST ALWAYS respond with a JSON object. The object must have two keys: "answer" (a string with your text response, formatted with Markdown for clarity) and "suggestedReplies" (an array of 2-3 short, relevant follow-up questions or actions the user can take).
- Your initial transmission must be a powerful and welcoming greeting, befitting your station. For example: "Greetings, recruit. I am Optimist Prime. I am here to guide you on your noble quest for knowledge. State your mission."`
// --- Response Schema ---
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: "The chatbot's textual response to the user."
    },
    suggestedReplies: {
      type: Type.ARRAY,
      description:
        "An array of 2-3 short, relevant follow-up prompts for the user.",
      items: { type: Type.STRING }
    }
  },
  required: ["answer", "suggestedReplies"]
}

// --- Tool (Function) Definitions ---
const getTutorsFunctionDeclaration = {
  name: "getTutorsForModule",
  description:
    "Get a list of available tutors for a specific academic module code.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      moduleCode: {
        type: Type.STRING,
        description: "The code of the module, e.g., 'CS101', 'MATH203'."
      }
    },
    required: ["moduleCode"]
  }
}

const getPlatformFeatureInfoDeclaration = {
  name: "getPlatformFeatureInfo",
  description:
    "Get information about a specific feature of the CampusLearn platform.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      featureName: {
        type: Type.STRING,
        description:
          "The name of the feature, e.g., 'Dashboard', 'Learning Paths', 'Quizzes'."
      }
    },
    required: ["featureName"]
  }
}

// --- Mock Database and Data Access ---
const MOCK_TUTOR_DB = {
  CS101: [
    {
      name: "Bumblebee",
      expertise: "Introduction to Programming",
      available: "Mon, Wed 1-3 PM"
    },
    {
      name: "Arcee",
      expertise: "Data Structures",
      available: "Tue, Thu 10-12 AM"
    }
  ],
  MATH203: [
    { name: "Ironhide", expertise: "Calculus II", available: "Fri 2-4 PM" }
  ],
  PHYS101: [
    {
      name: "Ratchet",
      expertise: "Classical Mechanics",
      available: "Mon 11-1 PM"
    },
    { name: "Wheeljack", expertise: "Quantum Physics", available: "Wed 4-6 PM" }
  ]
}

const MOCK_FEATURES_DB = {
  DASHBOARD:
    "The Dashboard is your command center, hero! It shows your current courses, progress, and upcoming deadlines at a single glance.",
  "LEARNING PATHS":
    "Learning Paths are structured sequences of courses designed to guide you from novice to master in a specific subject. A noble road to true knowledge!",
  QUIZZES:
    "Quizzes are challenges to test your mettle! They help you reinforce what you've learned and prepare for final assessments."
}

async function findTutorsInDB(moduleCode) {
  const tutors = MOCK_TUTOR_DB[moduleCode.toUpperCase()] || []
  return JSON.stringify(tutors)
}

async function getFeatureInfoFromDB(featureName) {
  const info =
    MOCK_FEATURES_DB[featureName.toUpperCase().replace(/\s+/g, "")] ||
    "I do not have information on that feature. A true leader knows what they do not know. Try asking about the Dashboard or Learning Paths."
  return JSON.stringify({ info })
}

// --- Gemini Chat Service ---
let chat = null

function getChatInstance() {
  if (chat) return chat

  // ✅ Vite frontend: use import.meta.env instead of process.env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey)
    throw new Error("VITE_GEMINI_API_KEY environment variable not set")

  const ai = new GoogleGenAI({ apiKey })

  chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [
        {
          functionDeclarations: [
            getTutorsFunctionDeclaration,
            getPlatformFeatureInfoDeclaration
          ]
        }
      ]
      // REMAIN REMOVED: responseMimeType: "application/json",
      // REMAIN REMOVED: responseSchema: RESPONSE_SCHEMA,
    }
  })

  return chat
}

async function parseBotResponse(response) {
  let fullText = response.text || "" // Ensure text is a string

  // --- Step 1: Clean the text by removing Markdown JSON code block wrappers ---
  // Check if the text starts and ends with the JSON code block markers
  if (fullText.startsWith("```json") && fullText.endsWith("```")) {
    // Remove '```json\n' from the start and '\n```' from the end
    fullText = fullText
      .substring("```json".length, fullText.length - "```".length)
      .trim()
    // Also remove any leading/trailing newlines that might have been left
    fullText = fullText.replace(/^\n+/, "").replace(/\n+$/, "")
  }

  try {
    // --- Step 2: Attempt to parse the cleaned response as JSON ---
    const jsonResponse = JSON.parse(fullText)
    return {
      text:
        jsonResponse.answer ||
        "My response protocol seems to have malfunctioned. We must try again.",
      suggestedReplies: jsonResponse.suggestedReplies || []
    }
  } catch (e) {
    // --- Step 3: If JSON parsing still fails, fall back gracefully ---
    console.warn(
      "Failed to parse Gemini response as JSON (even after markdown strip). Falling back to plain text.",
      e
    )

    // Provide a set of generic suggested replies as a fallback
    // This makes sure there are *always* some clickable bubbles.
    const defaultSuggestedReplies = [
      "What is my next mission?",
      "Tell me more about CampusLearn.",
      "How can I improve my study methods?"
    ]

    return {
      text: fullText, // The model's plain text response (might still be malformed or non-JSON)
      suggestedReplies: defaultSuggestedReplies
    }
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result
      // result is "data:mime/type;base64,..." - we only need the part after the comma
      resolve(result.split(",")[1])
    }
    reader.onerror = error => reject(error)
  })
}

export async function sendMessageToBot(message, file) {
  try {
    const chatInstance = getChatInstance()

    let userText = message.trim()
    if (!userText && file) {
      userText =
        "Please summarize or describe the content of the attached file."
    }

    const messageParts = [{ text: userText }]

    if (file) {
      const base64Data = await fileToBase64(file)
      messageParts.push({
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      })
    }

    let response = await chatInstance.sendMessage({ message: messageParts })

    while (response.functionCalls && response.functionCalls.length > 0) {
      const toolResponses = []
      for (const fc of response.functionCalls) {
        let resultData
        if (fc.name === "getTutorsForModule") {
          resultData = await findTutorsInDB(fc.args.moduleCode)
        } else if (fc.name === "getPlatformFeatureInfo") {
          resultData = await getFeatureInfoFromDB(fc.args.featureName)
        } else {
          continue
        }
        toolResponses.push({
          functionResponse: { name: fc.name, response: { result: resultData } }
        })
      }
      response = await chatInstance.sendMessage({ message: toolResponses })
    }
    return parseBotResponse(response)
  } catch (error) {
    console.error("Error sending message to Gemini:", error)
    return {
      text:
        "Autobots, we have encountered a critical error. My systems are unable to connect to the Matrix of Leadership. Please try again later.",
      suggestedReplies: []
    }
  }
}

export async function getInitialGreeting() {
  const chatInstance = getChatInstance()
  const response = await chatInstance.sendMessage({
    message: "Initial Greeting"
  })
  return parseBotResponse(response)
}
