# Unordered list of features in the roadmap

-   Implement star as operation and as module
-   Move imported resources out of SAM template (Cognito, EventBridge, etc)

-   List all users API endpoint pagination
-   Replay of events (or latest events) on new version deploy + archive of latest events (or all events?)
-   Data changing events should be all published to the event-bus (writes and deleted).
-   First time initialization should be triggered automatically over deployment automation (aws lambda invoke?) and not accessible through an API endpoint
-   Deploy of some sensitive information into AWS Secrets Manager
-   Events for local dev (can use local SAM events + invoke)
-   API Gateway endpoint caching (with cache purge on updates)
-   Document API in an OpenAPI file (Swagger)
-   Support for other event-bus services (Kinesis, Kafka, nats-streaming)
-   Support for other authentication services (Auth0)
