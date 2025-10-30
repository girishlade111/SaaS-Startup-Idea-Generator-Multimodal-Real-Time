# AI SaaS Idea Generator

_Fuse your vision with real-time market data to generate, validate, and refine your next big SaaS idea using multimodal AI._

## Overview

The **AI SaaS Idea Generator** is a sophisticated web application designed for entrepreneurs, product managers, and innovators. It leverages the power of the Google Gemini API to transform a simple user prompt into two fully-fledged, data-driven SaaS startup concepts.

Unlike basic idea generators, this tool uses live web signals via Google Search to ground its suggestions in current market trends, validate market need, and analyze the competitive landscape, providing users with a significant head start in their entrepreneurial journey.

## ✨ Key Features

*   **🧠 AI-Powered Idea Generation**: Utilizes `gemini-2.5-pro` to create two distinct and detailed SaaS ideas based on user inputs.
*   **🔍 Real-time Market Validation**: Integrates **Google Search** to ensure ideas are relevant and validated against current market data. All web sources are cited for transparency.
*   **📊 Comprehensive Idea Breakdown**: Each idea includes a wealth of information:
    *   Name & Tagline
    *   In-depth Description
    *   Target Problem
    *   Market Size Estimate
    *   Core Features & Tech Stack
    *   Revenue Model & Pricing Strategy
    *   **Competitive Landscape Analysis** (based on search results)
    *   Market Validation & Feasibility Scores
*   **🎨 AI Logo Generation**: Employs `imagen-4.0-generate-001` to generate a unique, minimalist logo concept for each startup idea.
*   **🔄 Iterative Logo Regeneration**: Users can provide a custom prompt (e.g., "use a blue color palette," "make it more abstract") to regenerate and refine the logo until it meets their vision.
*   **💾 Save & Manage Ideas**: A persistent **Dashboard** allows users to save their favorite ideas directly in the browser's local storage for future reference.
*   **📤 Export Functionality**: Easily export all generated ideas into a `JSON` file with a single click for offline use or integration with other tools.
*   **💅 Sleek & Responsive UI**: Built with Tailwind CSS for a modern, intuitive, and accessible user experience on any device.

## 🚀 How to Use

1.  **Provide Input**: On the **Generator** page, fill out the form on the left. You can provide a text description, industry, and target audience. The **Web Search Query** is crucial for market validation.
2.  **Generate Ideas**: Click the `Generate Ideas` button and wait for the AI to work its magic.
3.  **Review & Analyze**: The results will appear on the right. Dive into each `IdeaCard` to analyze the details. Scroll to the bottom to review the web sources used by the AI.
4.  **Visualize Your Brand**: Click `Generate Logo` on any card to create a visual identity. Not satisfied? Click `Regenerate`, type in your preferences, and generate a new one.
5.  **Save Your Favorites**: Click the **Bookmark Icon** on any idea you'd like to keep.
6.  **Visit Your Dashboard**: Navigate to the **Dashboard** page to view and manage all your saved ideas. Any logos you generate here are also saved automatically.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **AI Models**:
    *   **Idea Generation & Grounding**: Google Gemini API (`gemini-2.5-pro` with Google Search tool)
    *   **Logo Generation**: Google Gemini API (`imagen-4.0-generate-001`)
*   **Dependencies**: `uuid` for unique ID generation.
