.PHONY: build-RuntimeDependenciesLayer build-lambda-common
.PHONY: build-MsAuthAPIFunction
.PHONY: build-MsAuthEventsFunction
.PHONY: build-CognitoPretokenTriggerFunction

build-MsAuthAPIFunction:
	$(MAKE) HANDLER=src/handlers/auth-api.ts build-lambda-common

build-MsAuthEventsFunction:
	$(MAKE) HANDLER=src/handlers/auth-events.ts build-lambda-common

build-CognitoPretokenTriggerFunction:
	$(MAKE) HANDLER=src/handlers/cognito-pretoken-trigger.ts build-lambda-common
	
build-lambda-common:
	npm install
	rm -rf dist
	echo "{\"extends\": \"./tsconfig.json\", \"include\": [\"${HANDLER}\"] }" > tsconfig-only-handler.json
	npm run build -- --build tsconfig-only-handler.json
	cp -r dist "$(ARTIFACTS_DIR)/"

build-RuntimeDependenciesLayer:
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	cp package.json package-lock.json "$(ARTIFACTS_DIR)/nodejs/"
	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/"
	rm "$(ARTIFACTS_DIR)/nodejs/package.json" # to avoid rebuilding when changes aren't related to dependencies
