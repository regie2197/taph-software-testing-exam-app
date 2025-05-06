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

      // Add a check for authentication indicators
      cy.contains('Log out').should('be.visible')
    })
  }, {
    cacheAcrossSpecs: true,
    // Add cookie validation for server-side auth
    validate() {
      // Check for the specific Supabase cookie
      return cy.getCookie('sb-bxcqtplcvglztzrzczsi-auth-token')
        .then(cookie => {
          if (!cookie) return false
          // Optionally check if token isn't expired
          try {
            const parsed = JSON.parse(decodeURIComponent(cookie.value))
            const expiryTime = parsed?.expiresAt || 0
            return Date.now() < expiryTime * 1000
          } catch {
            // If parsing fails, just check cookie presence
            return !!cookie
          }
        })
    }
  })
})

Cypress.Commands.add('loginAsQuizMaster', () => {
  cy.auth('quizMaster')
})

Cypress.Commands.add('loginAsRegularUser', () => {
  cy.auth('regularUser')
})
Cypress.Commands.add('NagLogoutNaBro', () => {
  cy.contains('Log out').click()
  cy.url().should('include', '/login')
});