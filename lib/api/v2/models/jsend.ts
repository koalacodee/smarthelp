export type JSendStatus = "success" | "fail" | "error";

export interface JSendSuccess<T> {
  status: "success";
  data: { uploadKey?: string } & T;
}

export interface JSendFail {
  status: "fail";
  data: { details: { field: string; message: string }[] };
}

export interface JSendError {
  status: "error";
  message: string;
  code?: number;
  data?: Record<string, unknown>;
}

// If your API always returns success in this layer, alias to success only.
// Otherwise, you can widen to JSendSuccess<T> | JSendFail | JSendError
export type JSend<T> = JSendSuccess<T> | JSendFail;
