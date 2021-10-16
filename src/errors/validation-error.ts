export class ValidationError extends Error {
    constructor(private errors: string[]) {
        super('Validation error');
    }
}
