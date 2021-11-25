# Unordered list of features in the roadmap

-   List all users API endpoint pagination
-   Replay of events (or latest events) on new version deploy + archive of latest events (or all events?)
-   Data changing events should be all published to the event-bus (writes and deletes).
-   Deploy of some sensitive information into AWS Secrets Manager
-   Events for local dev (can use local SAM events + invoke)
-   API Gateway endpoint caching (with cache purge on updates)
-   Document API in an OpenAPI file (Swagger)
-   On permissions change for a logged-in user implement an update for the session too
-   Current authorization trigger makes 3 DB calls for one user (can we optimize to just 1 call?)
-   Prevent user from deleting themselves
