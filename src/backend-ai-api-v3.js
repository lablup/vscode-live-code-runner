'use babel';
/*
Backend.AI Cloud Javascript API Library (v2.9)
==============================================

(C) Copyright 2016-2018 Lablup Inc.
Licensed under MIT
*/
/*jshint esnext: true */
import fetch, {Headers} from 'node-fetch';
var crypto = require('crypto');

export default class BackendAISDK {
  constructor() {
    this.code = null;
    this._accessKey = null;
    this._secretKey = null;
    this.signKey = null;
    this.apiVersionMajor = 'v2';
    this.apiVersion = 'v2.20170315';
    this.hash_type = 'sha256';
    this.baseURL = 'https://api.backend.ai';
    this.endpoint = 'api.backend.ai';
    this.kernelId = null;
    this.kernelType = null;
  }

  get accessKey() {
    if (this._accessKey === null) {
      console.debug('No access key is given');
    }
    return this._accessKey;
  }

  get secretKey() {
    if (this._secretKey === null) {
      console.debug('No secret key is given');
    }
    return this._secretKey;
  }

  set accessKey(key) {
    this._accessKey = key;
  }

  set secretKey(key) {
    this._secretKey = key;
  }

  getAPIversion() {
    let d = new Date();
    let requestHeaders = new Headers({
      "Content-Type": "application/json",
      "X-Sorna-Date": d.toISOString()
    });

    let requestInfo = {
      method: 'GET',
      headers: requestHeaders,
      mode: 'cors',
      cache: 'default'
    };

    return fetch(this.baseURL+'/'+this.apiVersionMajor, requestInfo)
      .then( function(response) {
        if (response.version) {
          console.log(`API version: ${response.version}`);
          return response.version;
        }
        return true;
      });
  }

  createKernel(kernelType) {
    let requestBody = {
      "lang": kernelType,
      "clientSessionToken": "backend-ai-live-code-runner",
      "resourceLimits": {
        "maxMem": 0,
        "timeout": 0
      }
    };
    let requestInfo = this.newRequest('POST', '/v2/kernel/create', requestBody);
    return fetch(this.baseURL + '/' + this.apiVersionMajor + '/kernel/create', requestInfo);
  }

  destroyKernel(kernelId) {
    let requestInfo = this.newRequest('DELETE', `/v2/kernel/${kernelId}`, null);
    return fetch(this.baseURL + '/' + this.apiVersionMajor + '/kernel/'+kernelId, requestInfo);
  }

  refreshKernel(kernelId) {
    let requestInfo = this.newRequest('PATCH', `/${this.apiVersionMajor}/kernel/${kernelId}`, null);
    return fetch(this.baseURL + '/' + this.apiVersionMajor + '/kernel/'+kernelId, requestInfo);
  }

  newRequest(method, queryString, body) {
    let requestBody;
    let d = new Date();
    this.signKey = this.getSignKey(this.secretKey, d);
    if (body === null) {
      requestBody = '';
    } else {
      requestBody = JSON.stringify(body);
    }

    let aStr = this.getAuthenticationString(method, queryString, d.toISOString(), requestBody);
    let sig = this.sign(this.signKey, 'binary', aStr, 'hex');

    let requestHeaders = new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(requestBody),
      'X-Sorna-Version': this.apiVersion,
      "X-Sorna-Date": d.toISOString(),
      "Authorization": `Sorna signMethod=HMAC-SHA256, credential=${this.accessKey}:${sig}`
      });

    let requestInfo = {
      method,
      headers: requestHeaders,
      cache: 'default',
      body: requestBody
    };
    return requestInfo;
  }

  runCode(code, kernelId, runId, mode) {
    let requestBody = {
      "mode": mode,
      "code": code,
      "runId": runId
    };
    let requestInfo = this.newRequest('POST', `/v2/kernel/${kernelId}`, requestBody);
    return fetch(this.baseURL + '/' + this.apiVersionMajor + '/kernel/' + kernelId, requestInfo);
  }

  getAuthenticationString(method, queryString, dateValue, bodyValue) {
    return ( method + '\n' + queryString + '\n' + dateValue + '\n' + 'host:' + this.endpoint +  '\n'+'content-type:application/json' + '\n' + 'x-sorna-version:'+this.apiVersion + '\n' + crypto.createHash(this.hash_type).update(bodyValue).digest('hex'));
  }

  getCurrentDate(now) {
    let year = (`0000${now.getUTCFullYear()}`).slice(-4);
    let month = (`0${now.getUTCMonth() + 1}`).slice(-2);
    let day = (`0${now.getUTCDate()}`).slice(-2);
    let t = year + month + day;
    return t;
  }

  sign(key, key_encoding, msg, digest_type) {
    let kbuf = new Buffer(key, key_encoding);
    let hmac = crypto.createHmac(this.hash_type, kbuf);
    hmac.update(msg, 'utf8');
    return hmac.digest(digest_type);
  }

  getSignKey(secret_key, now) {
    let k1 = this.sign(secret_key, 'utf8', this.getCurrentDate(now), 'binary');
    let k2 = this.sign(k1, 'binary', this.endpoint, 'binary');
    return k2;
  }
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports.BackendAISDK = BackendAISDK;
}