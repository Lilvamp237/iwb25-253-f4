import ballerina/http;
import ballerina/time;

// -----------------------------
// Type definitions
// -----------------------------

type Reply record {|
    readonly int id;
    string text;
    time:Utc timestamp;
    Reply[] replies; // Nested replies
|};

type Message record {|
    readonly int id;
    string text;
    float lat;
    float lon;
    time:Utc timestamp;
    Reply[] replies;
|};

// -----------------------------
// In-memory storage
// -----------------------------

Message[] messages = [];
int messageIdCounter = 0;

// -----------------------------
// Service
// -----------------------------

service / on new http:Listener(8080) {

    // Health check endpoint
    resource function get health(http:Caller caller, http:Request req) returns error? {
        check caller->respond("OK");
    }

    // POST /message - Create a new message
    resource function post message(http:Caller caller, http:Request req) returns error? {
        var payloadResult = req.getJsonPayload();
        if payloadResult is error {
            check caller->respond({ status: "error", message: "Invalid JSON format" });
            return;
        }

        json payload = payloadResult;
        if payload !is map<json> {
            check caller->respond({ status: "error", message: "Payload must be a JSON object" });
            return;
        }

        string? textValue = <string?>payload["text"];
        float? latValue = <float?>payload["lat"];
        float? lonValue = <float?>payload["lon"];

        if textValue is () || latValue is () || lonValue is () {
            check caller->respond({ status: "error", message: "Missing required fields: text, lat, lon" });
            return;
        }

        int newId;
        lock {
            messageIdCounter += 1;
            newId = messageIdCounter;
        }

        Message newMessage = {
            id: newId,
            text: textValue,
            lat: latValue,
            lon: lonValue,
            timestamp: time:utcNow(),
            replies: []
        };

        lock { messages.push(newMessage); }

        http:Created createdResponse = { body: newMessage };
        check caller->respond(createdResponse);
    }

    // POST /message/{id}/reply - Add a reply to a message or nested reply
    resource function post message/[int id]/reply(http:Caller caller, http:Request req) returns error? {
        var payloadResult = req.getJsonPayload();
        if payloadResult is error {
            check caller->respond({ status: "error", message: "Invalid JSON format" });
            return;
        }

        json payload = payloadResult;
        if payload !is map<json> {
            check caller->respond({ status: "error", message: "Payload must be a JSON object" });
            return;
        }

        string? textValue = <string?>payload["text"];
        int? parentReplyId = <int?>payload["parentReplyId"]; // Optional, for nested replies

        if textValue is () {
            check caller->respond({ status: "error", message: "Reply text is required" });
            return;
        }

        int newReplyId;
        lock { messageIdCounter += 1; newReplyId = messageIdCounter; }

        Reply newReply = {
            id: newReplyId,
            text: textValue,
            timestamp: time:utcNow(),
            replies: []
        };

        boolean added = false;
        lock {
            foreach var msg in messages {
                if msg.id == id {
                    // If parentReplyId is specified, find the parent reply
                    if parentReplyId is int {
                        if addNestedReply(msg.replies, parentReplyId, newReply) {
                            added = true;
                            break;
                        }
                    } else {
                        // Add directly to message
                        msg.replies.push(newReply);
                        added = true;
                        break;
                    }
                }
            }
        }

        if !added {
            check caller->respond({ status: "error", message: "Message or parent reply not found" });
            return;
        }

        check caller->respond({ status: "success", reply: newReply });
    }

    // GET /feed - Return all messages including replies
    resource function get feed(http:Caller caller, http:Request req) returns error? {
        performCleanup();
        check caller->respond({ status: "success", feed: messages });
    }

    // Optional: dummy favicon
    resource function get favicon(http:Caller caller, http:Request req) returns error? {
        check caller->respond("");
    }
}

// -----------------------------
// Add a nested reply recursively
// -----------------------------
function addNestedReply(Reply[] replies, int parentId, Reply newReply) returns boolean {
    foreach var r in replies {
        if r.id == parentId {
            r.replies.push(newReply);
            return true;
        }
        if addNestedReply(r.replies, parentId, newReply) {
            return true;
        }
    }
    return false;
}

// -----------------------------
// Cleanup old messages
// -----------------------------
function performCleanup() {
    final float fortyEightHoursInSeconds = 15.0; // testing
    time:Utc now = time:utcNow();

    lock {
        Message[] recentMessages = from var msg in messages
            where (<float>time:utcDiffSeconds(now, msg.timestamp) < fortyEightHoursInSeconds)
            select msg;

        messages = recentMessages;
    }
}
