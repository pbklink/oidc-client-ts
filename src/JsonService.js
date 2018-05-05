// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import { Log } from './Log';
import { Global } from './Global';

export class JsonService {
    constructor(XMLHttpRequestCtor = Global.XMLHttpRequest) {
        this._XMLHttpRequest = XMLHttpRequestCtor;
    }

    getJson(url, token) {
        Log.debug("JsonService.getJson", url);

        if (!url){
            Log.error("No url passed");
            throw new Error("url");
        }

        return new Promise((resolve, reject) => {

            var req = new this._XMLHttpRequest();
            req.open('GET', url);

            req.onload = function() {
                Log.debug("HTTP response received, status", req.status);

                if (req.status === 200) {
                    var contentType = req.getResponseHeader("Content-Type");
                    if (contentType && contentType.startsWith("application/json")) {
                        try {
                            resolve(JSON.parse(req.responseText));
                        }
                        catch (e) {
                            Log.error("Error parsing JSON response", e.message);
                            reject(e);
                        }
                    }
                    else {
                        reject(Error("Invalid response Content-Type: " + contentType + ", from URL: " + url));
                    }
                }
                else {
                    reject(Error(req.statusText + " (" + req.status + ")"));
                }
            };

            req.onerror = function() {
                Log.error("network error");
                reject(Error("Network Error"));
            };

            if (token) {
                Log.debug("token passed, setting Authorization header");
                req.setRequestHeader("Authorization", "Bearer " + token);
            }

            req.send();
        });
    }
}
