import ballerina/http;
import ballerina/time;

// Define the Message type
type Message record {
    string text;
    string location;
    time:Utc timestamp;
};

// In-memory storage for messages
Message[] messages = [];

service / on new http:Listener(8080) {

    // Health check endpoint
    resource function get health(http:Caller caller, http:Request req) returns error? {
        check caller->respond("OK");
    }

    // POST /message endpoint
    resource function post message(http:Caller caller, http:Request req) returns error? {
        // Get JSON payload from request
        json payload = check req.getJsonPayload();
        map<json> payloadMap = <map<json>>payload;

        // Extract values safely
        string textValue;
        string locationValue;

        if payloadMap["text"] is string {
            textValue = <string>payloadMap["text"];
        } else {
            check caller->respond({status: "error", message: "Text missing or invalid"});
            return;
        }

        if payloadMap["location"] is string {
            locationValue = <string>payloadMap["location"];
        } else {
            check caller->respond({status: "error", message: "Location missing or invalid"});
            return;
        }

        // Create and store message
        Message newMessage = {
            text: textValue,
            location: locationValue,
            timestamp: time:utcNow()
        };
        messages.push(newMessage);

        check caller->respond({
            status: "Message stored",
            message: newMessage
        });
    }

    // GET /feed endpoint (returns all messages for now)
    resource function get feed(http:Caller caller, http:Request req) returns error? {
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
