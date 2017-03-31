'use strict';

const Browser = require('./lib/browser');
const App = require('./lib/app');
const assert = require('assert');
const config = require('./config.js');

describe('tests', () => {
  let browser;
  let app;
  let port;

  before(() => {
    app = App(require('./apps/default')).listen(config.port);
    port = app.address().port;
  });

  after(() => {
    app.close();
  });

  beforeEach(() => {
    browser = Browser().url(`http://localhost:${port}`);
    return browser;
  });

  afterEach(() => browser.end());

  it('redirects to the address substep on a failed lookup', () =>
    browser.url('/one')
      .$('input')
      .setValue('BN25 1XY')
      .submitForm('form')
      .getUrl()
      .then(url => {
        assert.ok(url.includes('step=address'));
      })
  );

  it('redirects to the lookup step on a successful lookup', () =>
    browser.url('/one')
      .$('input')
      .setValue('CR0 2EU')
      .submitForm('form')
      .getUrl()
      .then(url => {
        assert.ok(url.includes('step=lookup'));
      })
  );

  it('fails on an invalid postcode', () =>
    browser.url('/one')
      .$('input')
      .setValue('INVALID')
      .submitForm('form')
      .getUrl()
      .then(url => {
        assert.ok(url.includes('step=postcode'));
      })
  );

  it('fails on a non-English postcode', () =>
    browser.url('/one')
      .$('input')
      .setValue('CH5 1AB')
      .submitForm('form')
      .getUrl()
      .then(url => {
        assert.ok(url.includes('step=postcode'));
      })
  );

  it('redirects to next step when an address is selected', () =>
    browser.url('/one')
      .$('input')
      .setValue('CR0 2EU')
      .submitForm('form')
      .selectByIndex('select', 1)
      .submitForm('form')
      .getUrl()
      .then(url => {
        assert.ok(url.includes('/two'));
      })
  );

  it('redirects back to postcode step if change link is clicked', () =>
    browser.url('/one')
      .$('input')
      .setValue('CR0 2EU')
      .submitForm('form')
      .getUrl()
      .then(url => {
        assert.ok(url.includes('step=lookup'));
      })
      .$('.change-postcode')
      .click()
      .getUrl()
      .then(url => {
        assert.ok(url.includes('step=postcode'));
      })
  );

  it('redirects to manual step if cant-find link is clicked', () =>
    browser.url('/one')
      .$('input')
      .setValue('CR0 2EU')
      .submitForm('form')
      .getUrl()
      .then(url => {
        assert.ok(url.includes('step=lookup'));
      })
      .$('.cant-find')
      .click()
      .getUrl()
      .then(url => {
        assert.ok(url.includes('step=manual'));
      })
  );

});
