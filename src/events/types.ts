import { EventBridgeEvent } from 'aws-lambda';

export enum AuthEventsDetailTypes {
    UserDeleted = 'User Deleted',
}

export enum AuthEventDetailTypes {
    UserDeleted = 'user.deleted',
    AuthUserDeleted = 'authorization.user.deleted',
}

export interface AuthEventDetail {
    type: AuthEventDetailTypes;
    data: {
        userId?: string;
    };
}

export type EventHandler = (
    event: EventBridgeEvent<AuthEventsDetailTypes, AuthEventDetail>,
) => Promise<string>;
