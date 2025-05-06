const { defineConfig } = require("cypress");
const baseConfig = require("./cypress.config");

module.exports = defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: "https://testautomation-ph-quiz-app.vercel.app", // Production URL or Preview URL
  },
  env: {
    environment: "production"
  }
});