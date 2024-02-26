import React from 'react'
import Navbar from '../src/components/Navbar'

describe('Navbar.jsx', () => {
  function renderNavbar() {
    cy.viewport(1920, 1080)
    cy.mount(<Navbar />)
  }

  describe('when render Navbar component', () => {
    it('should show the whole navbar component', () => {
      renderNavbar()
      cy.get('.navbar').should('be.visible')
    })

    it.skip('should show the navbar', () => {
      renderNavbar()
      cy.get('.navbar').should('exist')
    })

    it.skip('should show the logo', () => {
      renderNavbar()
      cy.get('.navbar-logo').should('exist')
    })
  })
})
