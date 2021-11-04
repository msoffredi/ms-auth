# API Postman collection

in this directory you can find a Postman (version 9.3.1+) collection with test requests for all API endpoints including authentication. Import the provided collection into your Postman application in order to use it for testing purposes. This collection is fully functional for both local and cloud endpoints testing (with proper configuration, see below).

## Dependencies

In order to use the provided Postman collection you will need to create one environment variable with the name `ms-auth-url` and assign it your local API base URL. For exammple `http://127.0.0.1:3000`. By using environments you can assign different values to each environment and test the API locally and in AWS (staging and production is you have both).

**Note: if you are testing your local endpoints for the first time, you need to make sure you have an initial configuration in place locally to ensure a proper testing user with enough privilegies exist in your application. Otherwise, your tests will fail with authentication and/or authorization errors. See the project [documentation](https://github.com/msoffredi/ms-auth/blob/main/README.md) for more details about it.**

## Authentication

Authentication has been configured to be set in the collection directory and automatically inherited by all endpoints needing it. So no specially configuration is needed on each endpoint. In order to configure authentication on your collection, you will need an authentication token (see main project [documentation](https://github.com/msoffredi/ms-auth/blob/main/README.md)), and then click on the collection folder in Postman, and in the Authorization tab paste your token in the Token field.

## Authorization considerations

While this is an authorization service in itself, it also has its own authorization constraints and you should be aware of them. Consult the main project [documentation](https://github.com/msoffredi/ms-auth/blob/main/README.md) for more details about it but the main issue is that the authenticated user needs enough permissions to access each of the endpoints requiring so. There is a built in testing configuartion you may already have (if you followed instructions in the main documentation) whoich is linked to the Postman configuration ans used by the testing suite automatically.

## Testing endpoints with URL parameters

Some endpoints will have URL parameters to specify for example which object you want to retrieve or delete (by ID). This has to be specified by using URL parameters in Postman. You can find this on each collection request under the Params tab.

## Testing endpoints with body parameters

Some endpoints (POST endpoints for example) will have body parameters as a JSON object sent to be processed. In those cases you will find the object in the corresponding collection requests under the Body tab.
