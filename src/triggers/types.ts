export type CognitoPreTokenGenerationTriggerSources =
    | 'TokenGeneration_HostedAuth'
    | 'TokenGeneration_Authentication'
    | 'TokenGeneration_NewPasswordChallenge'
    | 'TokenGeneration_AuthenticateDevice'
    | 'TokenGeneration_RefreshTokens';

/**
 * Array of objects with 1 property in the format of:
 *
 * moduleId: operationId
 *
 * where both moduleId and operationId are strings.
 */
export type UserPermissionsType = { [moduleId: string]: string }[];
