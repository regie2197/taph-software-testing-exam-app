import { generateRegistrationData } from "../../support/fakerUtils";

describe('Sprint 1 - Registration for Quiz Master & Regular Users', { testIsolation: false }, () => {
    let registrationData = null
    after(() => {
        cy.contains('Log out').click()
        cy.url().should('include', '/login')
        cy.clearAllSessionStorage()
    })
    before(() => {
        cy.visit('/register')
    })
    it('Verify user registration works for both Quiz Master and Regular User roles', () => {
        // The role is set to 'quiz_master' or 'user' in the registration data
        registrationData = generateRegistrationData()

        cy.log('Registering as ' + (registrationData.role === 'quiz_master' ? 'Quiz Master' : 'Regular User'))

        // Fill registration form
        cy.get('#username').type(registrationData.username)
        cy.get('#email').type(registrationData.email)
        cy.get('#password').type(registrationData.password)
        cy.get('#confirmPassword').type(registrationData.confirmPassword)

        // Select role using the roleId from the generated data
        cy.get('#' + registrationData.roleId).check()

        // Submit form
        cy.contains('Register').should('be.visible').click()
        cy.wait(2000)
        cy.url().should('include', '/login')
    })

    it('Verify newly created account can successfully log in and access appropriate URL', () => {
        // Login with the registration data from the previous test
        cy.log('Logging in as ' + registrationData.username)
        cy.get('[data-testid="input-username"]').type(registrationData.username)
        cy.get('[data-testid="input-password"]').type(registrationData.password)
        cy.get('[data-testid="login-button"]').click()

        cy.wait(2000)
        // Verify successful login
        cy.url().should('include', registrationData.expectedRedirect, { timeout: 10000 })
        cy.contains('Log out').should('be.visible')

        // Additional verifications based on role
        if (registrationData.role === 'quiz_master') {
            cy.contains('Manage Topics').should('be.visible')
        } else {
            cy.contains('Browse Topics').should('be.visible')
        }
    })
})