describe('Login Test Suite', () => {

  after(() => {
    cy.contains('Log out', {timeout: 6000}).click()
  })

  it('Verify that user is able to Login', () => {
    cy.visit('http://localhost:3000/')

    cy.contains('Log In').click().then(() => {
      cy.url().should('include', '/login')
      cy.get('#identifier').type('quizMaster')
      cy.get('#password').type('f@ssw0rd123')
      cy.get('[data-testid="login-button"]').click()
    })
  })
})