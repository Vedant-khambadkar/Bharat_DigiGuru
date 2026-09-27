import type { AxiosError } from "axios"

export const handleErrResult = (err: AxiosError) => {
  const url = String(err.config?.url || "");

  const errorCode = (err.response?.data as any)?.code;
  if (
    url.includes("generate-mcq") || 
    url.includes("/login") || 
    errorCode === "MAX_RECONNECT_ATTEMPTS_EXCEEDED"
  ) {
    return;
  }
};