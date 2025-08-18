import ballerina/http;
import ballerina/time;

// -------------------- Shared listener on :8080 --------------------
listener http:Listener ll = new (8080);

// -------------------- Types --------------------
type Reply record {|
    string id;
    string text;
    time:Utc timestamp;
|};

type Message record {|
    string id;
    string text;
    float lat;
    float lon;
    time:Utc timestamp;
    Reply[] replies; // non-optional so we can .push()
|};

type PostIn record {|
    string text;
    float  lat;
    float  lon;
|};

type ReplyIn record {|
    string messageId;
    string text;
|};

// -------------------- In-memory store --------------------
Message[] messages = [];
int nextId = 1;

// -------------------- Root service (health) --------------------
service / on ll {
    resource function get health() returns string {
        return "OK";
    }
}

// -------------------- API service --------------------
service /api on ll {

    // POST /api/message
    resource function post message(http:Request req) returns json|error {
        json raw = check req.getJsonPayload();
        // Safely convert JSON -> typed record
        PostIn p = check raw.cloneWithType(PostIn);

        Message msg = {
            id: nextId.toString(),
            text: p.text,
            lat: p.lat,
            lon: p.lon,
            timestamp: time:utcNow(),
            replies: []
        };
        messages.push(msg);
        nextId += 1;

        return { status: "Message stored", message: msg };
    }

    // GET /api/feed?lat=..&lon=..
    resource function get feed(http:Request req, float lat, float lon) returns Message[]|error {
        // TODO: apply ~2km distance filter using (lat, lon). For now return all.
        return messages;
    }

    // POST /api/reply
    resource function post reply(http:Request req) returns json|error {
        json raw = check req.getJsonPayload();
        ReplyIn rIn = check raw.cloneWithType(ReplyIn);

        // Find the message and append reply
        foreach int i in 0 ..< messages.length() {
            if messages[i].id == rIn.messageId {
                Reply r = {
                    id: time:utcNow().toString(),
                    text: rIn.text,
                    timestamp: time:utcNow()
                };
                messages[i].replies.push(r);
                return { status: "Reply stored", reply: r };
            }
        }
        return { status: "not_found", messageId: rIn.messageId };
    }
}
