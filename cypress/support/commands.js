Cypress.Commands.add('auth', (userType) => {
  cy.session(`${userType}Session`, () => {
    cy.fixture('users').then((users) => {
      const user = users[userType]

      if (!user) {
        throw new Error("User type \"" + userType + "\" not found in fixtures/users.json")
      }
      
      cy.visit('/login')
      cy.get('[data-testid="input-username"]').type(user.username)
      cy.get('[data-testid="input-password"]').type(user.password)
      cy.get('[data-testid="login-button"]').click()
      cy.url().should('include', user.redirectUrl)
    })
  })
})

Cypress.Commands.add('loginAsQuizMaster', () => {
  cy.auth('quizMaster')
})

Cypress.Commands.add('loginAsRegularUser', () => {
  cy.auth('regularUser')
})
  