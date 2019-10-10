import { CONSENT_MANAGEMENT, giveConsent } from '../helpers/consent-management';
import { standardUser } from '../sample-data/shared-users';
import { login } from './auth-forms';
import { registerUser } from './checkout-flow';
import { switchLanguage } from './language';
import { signOutUser } from './login';
import { PAGE_URL_LOGIN } from './update-password';
import { generateMail, randomString } from './user';

export function seeBannerAsAnonymous() {
  cy.get('cx-anonymous-consent-management-banner').should('exist');
}

export function checkBannerHidden() {
  cy.get('cx-anonymous-consent-management-banner').should('not.be.visible');
}

export function openDialogUsingFooterLink() {
  cy.get('.anonymous-consents').within(() => {
    const link = cy.get('a');
    link.should('exist');
    link.click({ force: true });
  });
}

export function checkDialogOpen() {
  cy.get('cx-anonymous-consents-dialog').should('exist');
}

export function checkDialogClosed() {
  cy.get('cx-anonymous-consents-dialog').should('not.exist');
}

export function closeDialog() {
  cy.get('cx-anonymous-consents-dialog button.close').click();
}

export function checkConsentsGiven() {
  cy.get('.cx-toggle-text').each($match => {
    cy.wrap($match).should('contain.text', 'ON');
  });
}

export function giveSecondAnonymousConsent() {
  cy.get('.cx-dialog-row:nth-child(2)')
    .find('input')
    .click();
}

export function checkConsentsWithdrawn() {
  cy.get('.cx-toggle-text').each($match => {
    cy.wrap($match).should('contain.text', 'OFF');
  });
}

export function bannerTest() {
  it('should be able to see the banner as an anonymous user', () => {
    seeBannerAsAnonymous();
  });
  it('should close the banner and give all consents by clicking on Allow All in the banner', () => {
    cy.get('cx-anonymous-consent-management-banner')
      .find('.btn-primary')
      .click();
    checkBannerHidden();
  });
  describe('when View Details button is clicked', () => {
    before(() => {
      cy.window().then(win => win.localStorage.clear());
      cy.visit('/');
    });
    it('should close the banner and open the dialog', () => {
      cy.get('cx-anonymous-consent-management-banner')
        .find('.btn-action')
        .click();
      checkBannerHidden();
      checkDialogOpen();
      closeDialog();
    });
  });
}

export function loggedInUserBannerTest() {
  it('should not render the banner', () => {
    cy.get('cx-anonymous-consent-management-banner').should('not.exist');
  });
}

export function footerLinkTest() {
  describe('when anonymous', () => {
    it('should see the footer link and open the dialog', () => {
      openDialogUsingFooterLink();
      checkDialogOpen();
      closeDialog();
    });
  });
}

export function loggedInUserFooterLinkTest() {
  it('should not render the footer link', () => {
    cy.get('.anonymous-consents').should('not.exist');
  });
}

export function dialogTest() {
  describe('dialog tests', () => {
    beforeEach(() => {
      openDialogUsingFooterLink();
    });

    afterEach(() => {
      closeDialog();
    });

    describe('Allow all', () => {
      it('should allow all consents and close the dialog', () => {
        cy.get('cx-anonymous-consents-dialog').within(() => {
          cy.get('.cx-dialog-buttons > :nth-child(3)').click();
        });
        checkDialogClosed();
        openDialogUsingFooterLink();
        checkConsentsGiven();
      });
    });

    describe('Reject all', () => {
      it('should withdraw all consents and close the dialog', () => {
        cy.get('cx-anonymous-consents-dialog').within(() => {
          cy.get('.cx-dialog-buttons > :nth-child(1)').click();
        });
        checkDialogClosed();
        openDialogUsingFooterLink();
        checkConsentsWithdrawn();
      });
    });
  });
}

export function moveAnonymousUserToLoggedInUser() {
  it('should ignore the anonymous consents and load the previously given registered consents', () => {
    standardUser.registrationData.email = generateMail(randomString(), true);
    cy.requireLoggedIn(standardUser);
    cy.visit(CONSENT_MANAGEMENT);
    giveConsent();
    signOutUser();

    openDialogUsingFooterLink();
    giveSecondAnonymousConsent();
    closeDialog();

    cy.visit(PAGE_URL_LOGIN);
    login(
      standardUser.registrationData.email,
      standardUser.registrationData.password
    );
    cy.visit(CONSENT_MANAGEMENT);
    cy.get('input[type="checkbox"]')
      .first()
      .should('be.checked');
  });
}

export function movingFromAnonymousToRegisteredUser() {
  it('should transfer anonoymous consents when registered', () => {
    openDialogUsingFooterLink();
    giveSecondAnonymousConsent();
    closeDialog();

    const newUser = registerUser();
    login(newUser.email, newUser.password);
    cy.selectUserMenuOption({
      option: 'Consent Management',
    });
    cy.get('input[type="checkbox"]:nth-child(2)')
      .first()
      .should('be.checked');
  });
}

export function movingFromLoggedInUserToAnonymousUser() {
  it('should restore anonoymous consents when logging out', () => {
    const newUser = registerUser();
    cy.visit(PAGE_URL_LOGIN);
    login(newUser.email, newUser.password);
    signOutUser();

    openDialogUsingFooterLink();
    giveSecondAnonymousConsent();
    closeDialog();

    cy.visit(PAGE_URL_LOGIN);
    login(newUser.email, newUser.password);
    signOutUser();

    openDialogUsingFooterLink();
    cy.get('.cx-toggle-text:nth-child(2)').should('contain.text', 'ON');
  });
}

export function changeLanguageTest() {
  it('should pull the new consent templates but preserve the consents state', () => {
    openDialogUsingFooterLink();
    cy.get('cx-anonymous-consents-dialog').within(() => {
      cy.get('.cx-dialog-buttons > :nth-child(3)').click();
    });

    switchLanguage('de');
    openDialogUsingFooterLink();
    checkConsentsGiven();
  });
}

export function giveRegistrationConsentTest() {
  it('should give the registration consent', () => {
    const newUser = registerUser(true);
    login(newUser.email, newUser.password);
    cy.visit(CONSENT_MANAGEMENT);
    cy.get('input[type="checkbox"]')
      .first()
      .should('be.checked');
  });
}
