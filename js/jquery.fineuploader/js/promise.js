/*globals qq*/
qq.Promise = function() {
    "use strict";

    var successArgs, failureArgs,
            successCallbacks = [],
            failureCallbacks = [],
            doneCallbacks = [],
            state = 0;

    return {
        then: function(onSuccess, onFailure) {
            if (state === 0) {
                if (onSuccess) {
                    successCallbacks.push(onSuccess);
                }
                if (onFailure) {
                    failureCallbacks.push(onFailure);
                }
            }
            else if (state === -1 && onFailure) {
                onFailure.apply(null, failureArgs);
            }
            else if (onSuccess) {
                onSuccess.apply(null, successArgs);
            }

            return this;
        },
        done: function(callback) {
            if (state === 0) {
                doneCallbacks.push(callback);
            }
            else {
                callback.apply(null, failureArgs === undefined ? successArgs : failureArgs);
            }

            return this;
        },
        success: function() {
            state = 1;
            successArgs = arguments;

            if (successCallbacks.length) {
                qq.each(successCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs)
                })
            }

            if (doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs)
                })
            }

            return this;
        },
        failure: function() {
            state = -1;
            failureArgs = arguments;

            if (failureCallbacks.length) {
                qq.each(failureCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                })
            }

            if (doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                })
            }

            return this;
        }
    };
};

qq.isPromise = function(maybePromise) {
    return maybePromise && maybePromise.then && maybePromise.done;
};
