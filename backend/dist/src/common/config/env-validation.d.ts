export declare class EnvironmentValidator {
    private static logger;
    static validate(): void;
    private static performSecurityChecks;
    static getEnvironmentInfo(): Record<string, string | boolean>;
}
