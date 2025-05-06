after(() => {
    cy.clearAllSessionStorage()
  })
describe('Sprint - 1 Navigation for Regular User',{testIsolation: false}, () => {

    before(() => {
      cy.loginAsRegularUser()
    })

    after(() => {
      cy.NagLogoutNaBro()
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