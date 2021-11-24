import AWS from 'aws-sdk';

export const setCognitoTrigger = (userPoolName, trigger, lambdaName) => {
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
                    LambdaConfig[trigger] =
                        'arn:aws:lambda:us-east-1:653284769887:function:ms-auth-CognitoPretokenTriggerFunction-8a6KtiRzH8kQ';

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

        // cognitoISP.updateUserPool(
        //     {
        //         UserPoolId,
        //         LambdaConfig: {},
        //     },
        //     (err, data) => {
        //         if (err) {
        //             throw err;
        //         }
        //         console.log(data);
        //     },
        // );
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
