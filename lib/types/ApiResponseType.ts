//Defining the base structure common to all responses
interface BaseApiResponse {
    success: boolean;
}

//Defining the type for a successful response
export interface SuccessResponse<T> extends BaseApiResponse {
    success: true;
    data: T; // Use a generic type T for the payload
    error?: undefined; // Explicitly mark 'error' as absent
}

// Defining the type for a failed response
export interface FailedResponse extends BaseApiResponse {
    success: false;
    data?: undefined; // Explicitly mark 'data' as absent
    error: string;
}

// Create the final Union Type
export type ApiResponse<T> = SuccessResponse<T> | FailedResponse;

/**
 * A utility class for creating strongly-typed API response objects.
 * Uses static factory methods to simplify object creation.
 */
export class ApiResponseBuilder {

    /**
     * Creates a successful API response object.
     * @param data The payload for the success response.
     * @returns A SuccessResponse object.
     */
    static success<T>(data: T): SuccessResponse<T> {
        return {
            success: true,
            data: data
        };
    }

    /**
     * Creates a failed API response object.
     * @param errorMessage The error message string.
     * @returns A FailedResponse object.
     */
    static error(errorMessage: string): FailedResponse {
        return {
            success: false,
            error: errorMessage
        };
    }
}