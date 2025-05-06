after(() => {
  cy.clearAllSessionStorage()
})

describe('Sprint - 1 Navigation for Quiz Master', () => {

  before(() => {
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


