# Personal AI Assistant for Dhruvik

A production-ready Next.js application that serves as a personal AI representative. It uses OpenAI function calling to intelligently fetch your availability and contact info based on user intents.

##  Setup Steps

1. **Initialize the Project**
   Create a new Next.js app and install dependencies:
   ```bash
   npx create-next-app@latest dhruvik-ai-assistant --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"
   cd dhruvik-ai-assistant
   npm install ai @ai-sdk/openai zod