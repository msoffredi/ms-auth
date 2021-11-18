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
