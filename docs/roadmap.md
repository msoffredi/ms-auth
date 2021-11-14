# Unordered list of features in the roadmap

-   Replay of events (or latest events) on new version deploy + archive of latest events (or all events?)
-   Deploy of some sensitive information into AWS Secrets Manager
-   List all users API endpoint pagination
-   Support for other event-bus services (Kinesis, Kafka, nats-streaming)
-   Support for other authentication services (Auth0)
-   API Gateway endpoint caching (with cache purge on updates)
-   Events for local dev (can use local SAM events + invoke)
-   First time initialization should be triggered automatically over deployment automation (aws lambda invoke?) and not accessible through an API endpoint
-   Data changing events should be all published to the event-bus (writes and deleted).
-   Document API in an OpenAPI file (Swagger)
-   Move imported resources out of SAM template (Cognito, EventBridge, etc)
-   Separate API handler from Event handler into 2 different lambdas
