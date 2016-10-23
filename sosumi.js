'use strict';
require('isomorphic-fetch');
const btoa = require('btoa');

const CLIENT_CONTEXT = {
  appName: 'FindMyiPhone',
  appVersion: '3.0',
  buildVersion: '376',
  clientTimestamp: 0,
  deviceUDID: null,
  inactiveTime: 1,
  osVersion: '7.0.3',
  productType: 'iPhone6,1'
};

const SERVER_CONTEXT = {
  callbackIntervalInMS: 10000,
  classicUser: false,
  clientId: null,
  cloudUser: true,
  deviceLoadStatus: '200',
  enableMapStats: false,
  isHSA: false,
  lastSessionExtensionTime: null,
  macCount: 0,
  maxDeviceLoadTime: 60000,
  maxLocatingTime: 90000,
  preferredLanguage: 'en-us',
  prefsUpdateTime: 0,
  sessionLifespan: 900000,
  timezone: null,
  trackInfoCacheDurationInSecs: 86400,
  validRegion: true
};

class Sosumi {

  constructor(opts = {}) {
    this.username = opts.username;
    this.password = opts.password;
    this.emailUpdates = !!opts.emailUpdates;
    this.host = 'fmipmobile.icloud.com';
    this.scope = null;
    this.initialized = false;
  }

  _request(opts = {}) {
    if (!this.scope) this.scope = this.username;
    if (!this.initialized && opts.method !== 'initClient') {
      return this.initClient().then(res => {
        this.initialized = true;
        return this._request(opts);
      });
    }

    const url = `https://${this.host}/fmipservice/device/${this.scope}/${opts.method}`;
    const json = !!opts.json;
    const headers = opts.headers || {};
    headers['Accept-Language'] = 'en-us';
    headers['Content-Type'] =  'application/json; charset=utf-8';
    headers['User-Agent'] = 'FindMyiPhone/376 CFNetwork/672.0.8 Darwin/14.0.0';
    headers['X-Apple-Realm-Support'] = '1.0';
    headers['X-Apple-Find-Api-Ver'] = '3.0';
    headers['X-Apple-Authscheme'] = 'UserIdGuest';
    headers['Authorization'] = 'Basic ' + btoa(`${this.username}:${this.password}`);

    return fetch(url, {
      method: 'POST',
      body: opts.data,
      headers
    })
    .then(this._setPartition.bind(this))
    .then(res => json ? res.json() : res);
  }

  _setPartition(res) {
    if (res.headers.has('x-apple-mme-host'))
      this.host = res.headers.get('x-apple-mme-host');
    if (res.headers.get('x-apple-mme-scope'))
      this.scope = res.headers.get('x-apple-mme-scope');
    return res;
  }

  _get(key) {
    return (body) => {
      const content = (body || {}).content || [];
      return content.length && (content[0] || {})[key];
    };
  }

  initClient() {
    const body = JSON.stringify({ clientContext: CLIENT_CONTEXT });
    return this._request({
      method: 'initClient',
      data: body
    });
  }

  getDevices() {
    return this.refreshClient();
  }

  refreshClient() {
    const data = JSON.stringify({
      clientContext: CLIENT_CONTEXT,
      serverContext: SERVER_CONTEXT
    });
    return this._request({
      method: 'refreshClient',
      data,
      json: true
    }).then(body => body.content || []);
  }

  sendMessage(opts = {}) {
    const data = JSON.stringify({
      clientContext: CLIENT_CONTEXT,
      serverContext: SERVER_CONTEXT,
      device: opts.device,
      emailUpdates: this.emailUpdates,
      sound: !!opts.sound,
      subject: opts.subject || 'Important Message',
      text: opts.text,
      userText: true
    });
    return this._request({
      method: 'sendMessage',
      data,
      json: true
    }).then(this._get('msg'));
  }

  playSound(opts = {}) {
    const data = JSON.stringify({
      clientContext: CLIENT_CONTEXT,
      serverContext: SERVER_CONTEXT,
      device: opts.device,
      subject: opts.subject || 'Find My iPhone Alert'
    });
    return this._request({
      method: 'playSound',
      data,
      json: true
    }).then(this._get('snd'));
  }
}

module.exports = Sosumi;