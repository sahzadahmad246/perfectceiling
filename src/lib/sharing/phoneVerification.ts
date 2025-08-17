// lib/sharing/phoneVerification.ts

/**
 * Extracts the last 4 digits from a phone number string
 * @param phoneNumber - The full phone number
 * @returns The last 4 digits as a string
 */
export function extractLastFourDigits(phoneNumber: string): string {
    // Remove all non-numeric characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // Return the last 4 digits, or pad with zeros if less than 4 digits
    return digitsOnly.slice(-4).padStart(4, '0');
}

/**
 * Validates the format of phone digits input (should be exactly 4 digits)
 * @param phoneDigits - The phone digits to validate
 * @returns True if the input is valid (exactly 4 digits)
 */
export function isValidPhoneDigitsFormat(phoneDigits: string): boolean {
    // Check if input is exactly 4 digits
    const digitRegex = /^\d{4}$/;
    return digitRegex.test(phoneDigits);
}

/**
 * Sanitizes phone digits input by removing non-numeric characters
 * @param input - The raw input string
 * @returns Sanitized string containing only digits
 */
export function sanitizePhoneDigits(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Remove all non-numeric characters and limit to 4 digits
    return input.replace(/\D/g, '').slice(0, 4);
}

/**
 * Compares the provided phone digits with the stored phone number
 * @param providedDigits - The 4 digits provided by the user
 * @param storedPhoneNumber - The full phone number stored in the database
 * @returns True if the last 4 digits match
 */
export function verifyPhoneDigits(providedDigits: string, storedPhoneNumber: string): boolean {
    // Sanitize the provided digits
    const sanitizedProvided = sanitizePhoneDigits(providedDigits);

    // Validate format
    if (!isValidPhoneDigitsFormat(sanitizedProvided)) {
        return false;
    }

    // Extract last 4 digits from stored phone number
    const storedLastFour = extractLastFourDigits(storedPhoneNumber);

    // Compare the digits
    return sanitizedProvided === storedLastFour;
}

/**
 * Validates phone digits input and provides detailed error information
 * @param phoneDigits - The phone digits to validate
 * @returns Validation result with success status and error message
 */
export function validatePhoneDigitsInput(phoneDigits: string): {
    isValid: boolean;
    error?: string;
    sanitized?: string;
} {
    if (!phoneDigits) {
        return {
            isValid: false,
            error: 'Phone digits are required',
        };
    }

    if (typeof phoneDigits !== 'string') {
        return {
            isValid: false,
            error: 'Phone digits must be a string',
        };
    }

    const sanitized = sanitizePhoneDigits(phoneDigits);

    if (sanitized.length === 0) {
        return {
            isValid: false,
            error: 'Please enter numeric digits only',
        };
    }

    if (sanitized.length < 4) {
        return {
            isValid: false,
            error: 'Please enter exactly 4 digits',
        };
    }

    if (sanitized.length > 4) {
        return {
            isValid: false,
            error: 'Please enter only 4 digits',
        };
    }

    return {
        isValid: true,
        sanitized,
    };
}