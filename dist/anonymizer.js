"use strict";
/**
 * FERPA-compliant data anonymization utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentDataAnonymizer = void 0;
class StudentDataAnonymizer {
    anonymizationMap = new Map();
    isEnabled;
    constructor(enabled = true) {
        this.isEnabled = enabled;
    }
    /**
     * Generate consistent anonymous ID for a given value
     */
    generateAnonymousId(value, prefix = 'Student') {
        if (this.anonymizationMap.has(value)) {
            return this.anonymizationMap.get(value);
        }
        // Create a simple hash-based anonymous ID
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        const anonymousId = `${prefix}_${Math.abs(hash) % 100000}`.padEnd(12, '0');
        this.anonymizationMap.set(value, anonymousId);
        return anonymousId;
    }
    /**
     * Anonymize student data in Canvas API responses
     */
    anonymizeData(data) {
        if (!this.isEnabled) {
            return data;
        }
        return this.anonymizeRecursive(data);
    }
    anonymizeRecursive(data) {
        if (data === null || data === undefined) {
            return data;
        }
        if (Array.isArray(data)) {
            return data.map(item => this.anonymizeRecursive(item));
        }
        if (typeof data === 'object') {
            const anonymized = { ...data };
            // Student identifying fields
            const studentFields = ['name', 'sortable_name', 'short_name', 'display_name'];
            const emailFields = ['email', 'login_id', 'sis_user_id'];
            const sensitiveFields = ['avatar_url', 'bio', 'time_zone', 'locale'];
            for (const [key, value] of Object.entries(anonymized)) {
                if (typeof value === 'string') {
                    if (studentFields.includes(key)) {
                        anonymized[key] = this.generateAnonymousId(value, 'Student');
                    }
                    else if (emailFields.includes(key)) {
                        anonymized[key] = this.generateAnonymousId(value, 'student') + '@anonymous.edu';
                    }
                    else if (sensitiveFields.includes(key)) {
                        anonymized[key] = '[ANONYMIZED]';
                    }
                }
                else if (typeof value === 'object') {
                    anonymized[key] = this.anonymizeRecursive(value);
                }
            }
            return anonymized;
        }
        return data;
    }
    /**
     * Check if anonymization is enabled
     */
    isAnonymizationEnabled() {
        return this.isEnabled;
    }
    /**
     * Get anonymization status for reporting
     */
    getAnonymizationStatus() {
        return {
            enabled: this.isEnabled,
            mappedEntries: this.anonymizationMap.size,
            lastActivity: this.anonymizationMap.size > 0 ? new Date() : null,
        };
    }
    /**
     * Create a mapping export for local de-anonymization
     * This should only be used for legitimate educational purposes
     */
    exportAnonymizationMap() {
        if (!this.isEnabled) {
            return {};
        }
        const exportMap = {};
        this.anonymizationMap.forEach((anonymous, original) => {
            exportMap[anonymous] = original;
        });
        return exportMap;
    }
    /**
     * Clear the anonymization mapping
     */
    clearMappings() {
        this.anonymizationMap.clear();
    }
}
exports.StudentDataAnonymizer = StudentDataAnonymizer;
//# sourceMappingURL=anonymizer.js.map