const { defineConfig } = require("cypress");

module.exports = defineConfig({
  defaultCommandTimeout: 60000,
  experimentalStudio: true,
  watchForFileChanges: false,
  retries: 2,
  e2e: {
    //baseUrl: "http://localhost:1437", // Default development URL
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    }
  },
});