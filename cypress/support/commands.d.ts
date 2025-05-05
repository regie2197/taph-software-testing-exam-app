/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as a Quiz Master
       * @example cy.loginAsQuizMaster()
       */
      loginAsQuizMaster(): Chainable<void>
  
      /**
       * Custom command to login as a Regular User
       * @example cy.loginAsRegularUser()
       */
      loginAsRegularUser(): Chainable<void>
      
      /**
       * Generic login command that accepts a user type
       * @param userType - The type of user to login as (from fixtures/users.json)
       * @example cy.login('quizMaster')
       */
      login(userType: string): Chainable<void>
    }
  }