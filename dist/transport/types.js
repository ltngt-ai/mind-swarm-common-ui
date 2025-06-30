/**
 * Transport layer types and interfaces
 */
/**
 * Transport connection states
 */
export var TransportState;
(function (TransportState) {
    TransportState["DISCONNECTED"] = "disconnected";
    TransportState["CONNECTING"] = "connecting";
    TransportState["CONNECTED"] = "connected";
    TransportState["DISCONNECTING"] = "disconnecting";
    TransportState["ERROR"] = "error";
})(TransportState || (TransportState = {}));
/**
 * Transport event types
 */
export var TransportEvent;
(function (TransportEvent) {
    TransportEvent["CONNECTED"] = "connected";
    TransportEvent["DISCONNECTED"] = "disconnected";
    TransportEvent["MESSAGE"] = "message";
    TransportEvent["ERROR"] = "error";
    TransportEvent["STATE_CHANGE"] = "state_change";
})(TransportEvent || (TransportEvent = {}));
//# sourceMappingURL=types.js.map