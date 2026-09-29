/**
 * BeeYield Agritech & Field Error Translator
 * Translates cryptic developer/backend exceptions (HTTP 500, SyntaxError, LoRa dropouts)
 * into actionable, user-friendly instructions for farm managers and beekeepers.
 */

import { toast } from 'sonner';

export interface TranslatedFieldError {
    title: string;
    message: string;
    troubleshootingStep: string;
    isNetworkIssue: boolean;
}

export function translateFieldError(error: unknown, fallbackContext?: string): TranslatedFieldError {
    const rawMessage = (error instanceof Error ? error.message : String(error || '')).toLowerCase();

    // 1. JSON parsing / Gateway response errors (e.g. gateway returned HTML or empty stream)
    if (rawMessage.includes('unexpected token') || rawMessage.includes('syntaxerror') || rawMessage.includes('json')) {
        return {
            title: 'Gateway Sync Interrupted',
            message: 'Unable to parse field gateway stream. The solar hardware or LoRa node may have restarted.',
            troubleshootingStep: 'Check if the field gateway solar battery is charged and antenna is unobstructed.',
            isNetworkIssue: true
        };
    }

    // 2. Gateway Timeout (HTTP 504 / 408)
    if (rawMessage.includes('504') || rawMessage.includes('timeout') || rawMessage.includes('aborted')) {
        return {
            title: 'Field Station Timeout',
            message: 'Telemetry query took too long to respond due to weak remote signal.',
            troubleshootingStep: 'The app has loaded the last-known cached sensor snapshot automatically.',
            isNetworkIssue: true
        };
    }

    // 3. Network connection drop (Failed to fetch / ERR_INTERNET_DISCONNECTED)
    if (rawMessage.includes('failed to fetch') || rawMessage.includes('network') || rawMessage.includes('load failed')) {
        return {
            title: 'Weak Cellular Coverage',
            message: 'Your mobile device temporarily lost cellular data connection in the orchard.',
            troubleshootingStep: 'Offline mode active. Your field inspection notes will sync once signal returns.',
            isNetworkIssue: true
        };
    }

    // 4. Missing Device / Sensor ID
    if (rawMessage.includes('device id') || rawMessage.includes('missing id') || rawMessage.includes('unregistered')) {
        return {
            title: 'Sensor Hardware Not Paired',
            message: 'This hive does not have an active sensor ID registered.',
            troubleshootingStep: 'Scan the QR code on the hive sensor enclosure or assign a serial in the Hardware tab.',
            isNetworkIssue: false
        };
    }

    // 5. Database Row Not Found / Perms
    if (rawMessage.includes('pgrst116') || rawMessage.includes('not found')) {
        return {
            title: 'Colony Record Not Found',
            message: 'The requested hive or apiary location could not be located in your fleet.',
            troubleshootingStep: 'Refresh your fleet list or check if another farm manager archived this record.',
            isNetworkIssue: false
        };
    }

    // 6. Auth / Session Expired
    if (rawMessage.includes('401') || rawMessage.includes('jwt') || rawMessage.includes('unauthorized')) {
        return {
            title: 'Session Expired',
            message: 'Your secure login session has expired.',
            troubleshootingStep: 'Please sign back in to continue syncing cloud telemetry.',
            isNetworkIssue: false
        };
    }

    // Default Friendly Agritech Fallback
    return {
        title: fallbackContext ? `Notice: ${fallbackContext}` : 'Field Operation Notice',
        message: 'Could not complete telemetry sync at this moment.',
        troubleshootingStep: 'Verify your field gateway status and retry.',
        isNetworkIssue: false
    };
}

/**
 * Fires a clean, human-friendly toast notification instead of a raw cryptic stack trace
 */
export function notifyFieldError(error: unknown, fallbackContext?: string) {
    const translated = translateFieldError(error, fallbackContext);
    toast.error(translated.title, {
        description: `${translated.message} ${translated.troubleshootingStep}`,
        duration: 5000,
    });
}
