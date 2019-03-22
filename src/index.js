require("babel-polyfill");

const jjjrmi = require("jjjrmi");

function NERVEWrapper() {
    let currentResult = null;
    let currentContext = null;

    let serverListener = null;

    function handleResult(result) {
        currentResult = result.text;
        currentContext = JSON.parse(result.context);

        return {
            context: currentContext,
            result: currentResult
        }
    }

    return {
        init: async function(url, messageRelay) {
            jjjrmi.JJJRMISocket.flags.CONNECT = true;
            jjjrmi.JJJRMISocket.flags.RECEIVED = true;
            jjjrmi.JJJRMISocket.flags.SENT = true;

            jjjrmi.JJJRMISocket.registerPackage(require("./nerveserver/package"));
            jjjrmi.JJJRMISocket.registerPackage(require("jjjsql"));
            // jjjrmi.JJJRMISocket.registerPackage(require("nerscriber"));

            this.rootSocket = new jjjrmi.JJJRMISocket("NerveSocket");
            this.rootObject = await this.rootSocket.connect(url);
            this.scriber = this.rootObject.getScriber();

            // let dictionary = this.rootObject.getDictionary();
            let progressMonitor = this.rootObject.getProgressMonitor();
            serverListener = new ServerListener(messageRelay);
            progressMonitor.addListener(serverListener);
        },

        run: async function(document, options) {
            if (options === undefined) {
                options = ['tag', 'link'];
            }
            let doTag = options.indexOf('tag') !== -1;
            let doLink = options.indexOf('link') !== -1;
            if (doTag && doLink) {
                return await this.encode(document);
            } else if (doTag) {
                return await this.tag(document);
            } else if (doLink) {
                return await this.link(document);
            }
        },

        encode: async function(document) {
            let result = await this.scriber.encode(document);
            return handleResult(result);
        },

        decode: async function(encodedDoc, contextName) {
            let result = await this.scriber.decode(encodedDoc, contextName);
            return result;
        },

        tag: async function(document) {
            let result = await this.scriber.tag(document);
            return handleResult(result);
        },

        link: async function(document) {
            let result = await this.scriber.link(document); 
            return handleResult(result);
        }
    }
}

function ServerListener(messageRelay) {
    return {
        serverStart: function(message) {
            messageRelay.call(this, 'serverStart', message)
        },
        
        serverUpdateMessage: function(message) {
            messageRelay.call(this, 'serverUpdateMessage', message)
        },
        
        serverUpdateProgress: function(percent) {
            messageRelay.call(this, 'serverUpdateProgress', percent)
        },
        
        serverEnd: function() {
            messageRelay.call(this, 'serverEnd', '')
        },

        ServerSideExceptionMessage: function(message) {
            messageRelay.call(this, 'ServerSideExceptionMessage', message)
        }
    }
}

module.exports = NERVEWrapper;
