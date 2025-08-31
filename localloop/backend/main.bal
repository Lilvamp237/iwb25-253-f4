import ballerina/http;
import ballerina/time;

// -----------------------------
// Type definitions
// -----------------------------

type Reply record {|
    readonly int id;
    string text;
    string timestamp;   // store as ISO string
    Reply[] replies; // Nested replies
|};

type Message record {|
    readonly int id;
    string text;
    float lat;
    float lon;
    string timestamp;
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

    resource function get health(http:Caller caller, http:Request req) returns error? {
        check caller->respond("OK");
    }

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
        float|error latResult = payload["lat"].cloneWithType(float);
        float|error lonResult = payload["lon"].cloneWithType(float);

        if textValue is () || latResult is error || lonResult is error {
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
            lat: latResult,
            lon: lonResult,
            timestamp: time:utcToString(time:utcNow()), // ✅ ISO timestamp
            replies: []
        };

        lock { messages.push(newMessage); }

        http:Created createdResponse = { body: newMessage };
        check caller->respond(createdResponse);
    }

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
            timestamp: time:utcToString(time:utcNow()), // ✅ ISO timestamp
            replies: []
        };

        boolean added = false;
        lock {
            foreach int i in 0 ..< messages.length() {
                if messages[i].id == id {
                    if parentReplyId is int {
                        if addNestedReply(messages[i].replies, parentReplyId, newReply) {
                            added = true;
                            break;
                        }
                    } else {
                        messages[i].replies.push(newReply);
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

    resource function get feed(http:Caller caller, http:Request req) returns error? {
        performCleanup();
        check caller->respond({ status: "success", feed: messages });
    }
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
    final float fortyEightHoursInSeconds = 3600.0; // testing
    //final float fortyEightHoursInSeconds = 172800.0;

    time:Utc now = time:utcNow();

    lock {
        Message[] recentMessages = from var msg in messages
            let time:Utc|error msgTime = time:utcFromString(msg.timestamp)
            where msgTime is time:Utc &&
                  <float>time:utcDiffSeconds(now, msgTime) < fortyEightHoursInSeconds
            select msg;

        messages = recentMessages;
    }
}

