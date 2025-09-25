



type SuccessResponse<T> ={
    data: T;
    message: null;
};

type ErrorResponse ={
    errorCode: Number;
    message: string;
};

type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export type { ApiResponse, SuccessResponse, ErrorResponse };