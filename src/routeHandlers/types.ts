export interface RouteHandlerResponse {
    status: number;
    body: Record<string, unknown> | unknown[];
}
