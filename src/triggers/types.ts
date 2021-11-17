export type CognitoPreTokenGenerationTriggerSources =
    | 'TokenGeneration_HostedAuth'
    | 'TokenGeneration_Authentication'
    | 'TokenGeneration_NewPasswordChallenge'
    | 'TokenGeneration_AuthenticateDevice'
    | 'TokenGeneration_RefreshTokens';

/**
 * Array of arrays of 2 string items:
 *
 * [ moduleId, operationId ]
 */
export type UserPermissionsType = [string, string][];
