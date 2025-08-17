import ballerina/http;
import ballerina/time;
//import ballerina/task;
//import ballerina/io;

// Define the Message type
//type Message record {
   // string text;
   // string location;
   // time:Utc timestamp;
//}

// Define the Message type with lat/lon and a unique ID
type Message record {|
    readonly int id;
    string text;
    float lat;
    float lon;
    time:Utc timestamp;
|};

// In-memory storage for messages
Message[] messages = [];
// A counter for unique message IDs
int messageIdCounter = 0;

service / on new http:Listener(8080) {

    // Health check endpoint
    resource function get health(http:Caller caller, http:Request req) returns error? {
        check caller->respond("OK");
    }

    // POST /message endpoint
    // POST /message endpoint (Final Corrected Version)
// POST /message endpoint (Final Version with Decimal/Float fix)
resource function post message(http:Caller caller, http:Request req) returns error? {

    // 1. Get the JSON payload from the request.
    var payloadResult = req.getJsonPayload();
    if payloadResult is error {
        http:BadRequest badRequestResponse = {body: "Invalid JSON format"};
        check caller->respond(badRequestResponse);
        return;
    }

    json payload = payloadResult;
    if payload !is map<json> {
        http:BadRequest badRequestResponse = {body: "Payload must be a JSON object"};
        check caller->respond(badRequestResponse);
        return;
    }

    // 3. Safely extract the fields.
    json textValue = payload.get("text");
    json latValue = payload.get("lat");
    json lonValue = payload.get("lon");

    // 4. Validate the types. This is the UPDATED logic.
    // It now accepts numbers as either 'float' OR 'decimal'.
    if textValue !is string || (latValue !is float && latValue !is decimal) || (lonValue !is float && lonValue !is decimal) {
        http:BadRequest badRequestResponse = {body: "Invalid payload. Required fields: text (string), lat (number), lon (number)"};
        check caller->respond(badRequestResponse);
        return;
    }

    // If all checks pass, we can now safely use the values.
    int newId;
    Message newMessage;

    lock {
        messageIdCounter += 1;
        newId = messageIdCounter;
    }

    // 6. Create the full Message record, CASTING the numbers to float.
    newMessage = {
        id: newId,
        text: textValue,
        lat: <float>latValue, // <-- Convert decimal/float to float
        lon: <float>lonValue, // <-- Convert decimal/float to float
        timestamp: time:utcNow()
    };

    lock {
        messages.push(newMessage);
    }

    http:Created createdResponse = {body: newMessage};
    check caller->respond(createdResponse);
}

    // GET /feed endpoint (returns all messages for now)
    //resource function get feed(http:Caller caller, http:Request req) returns error? {
      //  check caller->respond({
        //    status: "success",
         //   feed: messages
        //});
    //}
    // GET /feed endpoint (now with cleanup)
    resource function get feed(http:Caller caller, http:Request req) returns error? {
    // --- NEW: Call the cleanup function first! ---
        performCleanup();

    // Now, respond with the (now clean) list of messages.
        check caller->respond({
            status: "success",
            feed: messages
        });
    }

    // Optional: dummy favicon resource to avoid browser errors
    resource function get favicon(http:Caller caller, http:Request req) returns error? {
        check caller->respond("");
    }
}



// --- Day 2: Automatic Cleanup Job (Corrected) ---

// This is our new, simple cleanup function.
function performCleanup() {
    // Define the duration as a FLOAT to ensure correct type comparison.
    //final float fortyEightHoursInSeconds = 48 * 60 * 60.0;
    final float fortyEightHoursInSeconds = 15.0; // Used for testing
    time:Utc now = time:utcNow();

    lock {
        // Create a new list containing only messages that are NOT old.
        Message[] recentMessages = from var msg in messages
            where (<float>time:utcDiffSeconds(now, msg.timestamp) < fortyEightHoursInSeconds)
            select msg;
        
        // Replace the old list with the new, filtered list.
        messages = recentMessages;
    }
}


