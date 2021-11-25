import AWS from 'aws-sdk';

export const setCognitoTrigger = (userPoolName, trigger, lambdaArn) => {
    const cognitoISP = new AWS.CognitoIdentityServiceProvider();

    getUserPoolId(userPoolName, cognitoISP, (UserPoolId) => {
        cognitoISP.describeUserPool(
            {
                UserPoolId,
            },
            (err, data) => {
                if (err) {
                    throw err;
                }

                // console.log(data);
                const { LambdaConfig } = data.UserPool;

                if (!LambdaConfig[trigger]) {
                    LambdaConfig[trigger] = lambdaArn;

                    cognitoISP.updateUserPool(
                        {
                            UserPoolId,
                            LambdaConfig,
                        },
                        (err, data) => {
                            if (err) {
                                throw err;
                            }
                            console.log(
                                `${trigger} trigger successfully set in ${userPoolName} user pool`,
                            );
                        },
                    );
                } else {
                    console.error(
                        `Operation aborted: ${trigger} trigger in ${userPoolName} user pool already defined`,
                    );
                }
            },
        );
    });
};

export const getUserPoolId = (userPoolName, cognitoISP, callback) => {
    // Get all Cognito User Pools
    cognitoISP.listUserPools(
        {
            MaxResults: '60',
        },
        (err, data) => {
            if (err) {
                throw err;
            }

            // Filter out User Pools of interest
            const userPools = data.UserPools.filter((pool) => {
                if (pool.Name && pool.Name === userPoolName) {
                    return true;
                }
                return false;
            });

            if (userPools.length === 1) {
                callback(userPools[0].Id);
            } else {
                throw new Error(
                    'More than one user pool matching the criteria. Aborting',
                );
            }
        },
    );
};

export const getLambdaArn = async (lambdaName) => {
    const lambda = new AWS.Lambda();
    let lambdas = [];
    let end = false;
    let next = false;
    let nextMarker = null;

    while (!end) {
        lambda.listFunctions(
            {
                Marker: nextMarker,
                FunctionVersion: 'ALL',
                MaxItems: 5,
            },
            (err, data) => {
                if (err) {
                    throw err;
                }

                if (data.Functions.length) {
                    lambdas = [...lambdas, ...data.Functions];
                }

                if (data.NextMarker === null) {
                    end = true;
                } else {
                    nextMarker = data.NextMarker;
                }

                next = true;
            },
        );

        while (!next) {
            await sleep(10);
        }

        next = false;
    }

    const filteredLambdas = lambdas.filter((item) => {
        if (item.FunctionName.indexOf(lambdaName) >= 0) {
            return true;
        }

        return false;
    });

    if (filteredLambdas.length !== 1) {
        throw new Error('More than one lambda matching the name');
    }

    return filteredLambdas[0].FunctionArn.replace(':$LATEST', '');
};

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
