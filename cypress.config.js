import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://testautomation-ph-quiz-app.vercel.app/",
    setupNodeEvents(on, config) {
    },
  },
});
