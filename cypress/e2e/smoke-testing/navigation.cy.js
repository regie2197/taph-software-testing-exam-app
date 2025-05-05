after(() => {
  cy.clearAllSessionStorage()
})

describe('Sprint - 1 Navigation for Quiz Master', () => {

  beforeEach(() => {
    cy.loginAsQuizMaster()
  })

  it('Should navigate & show dashboard after login', () => {
    cy.visit('/dashboard')        
    cy.contains('Dashboard').should('be.visible').and('have.text', 'Dashboard')
  })
  it('Should navigate again to manage topics', () => {
    cy.visit('/manage-topics')
    cy.contains('Manage Topics').should('be.visible').and('have.text', 'Manage Topics')
  })

});

describe('Sprint - 1 Navigation for Regular User', () => {

  beforeEach(() => {
    cy.loginAsRegularUser()
  })

  it('Should navigate & show dashboard after login for Regular Users', () => {
    cy.visit('/dashboard')        
    cy.contains('Dashboard').should('be.visible').and('have.text', 'Dashboard')
  })
  it('Should navigate again to topics for Regular Users', () => {
    cy.visit('/topics')
    cy.contains('Browse Topics').should('be.visible').and('have.text', 'Browse Topics')
  })
  it('Regular User should not navigate to manage topics & redirects to Dashboard Page', () => {
    cy.visit('/manage-topics')
    cy.url().should('not.include', '/manage-topics')
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible').and('have.text', 'Dashboard')
  })

});

