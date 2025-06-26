/**
 * FERPA-compliant data anonymization utilities
 */
export declare class StudentDataAnonymizer {
    private anonymizationMap;
    private isEnabled;
    constructor(enabled?: boolean);
    /**
     * Generate consistent anonymous ID for a given value
     */
    private generateAnonymousId;
    /**
     * Anonymize student data in Canvas API responses
     */
    anonymizeData<T>(data: T): T;
    private anonymizeRecursive;
    /**
     * Check if anonymization is enabled
     */
    isAnonymizationEnabled(): boolean;
    /**
     * Get anonymization status for reporting
     */
    getAnonymizationStatus(): {
        enabled: boolean;
        mappedEntries: number;
        lastActivity: Date | null;
    };
    /**
     * Create a mapping export for local de-anonymization
     * This should only be used for legitimate educational purposes
     */
    exportAnonymizationMap(): Record<string, string>;
    /**
     * Clear the anonymization mapping
     */
    clearMappings(): void;
}
//# sourceMappingURL=anonymizer.d.ts.map