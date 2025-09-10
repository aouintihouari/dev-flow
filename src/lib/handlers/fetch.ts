import logger from "../logger";
import handleError from "./error";
import { RequestError } from "../http-errors";

interface fetchOptions extends RequestInit {
  timeout?: number;
}

const isError = (error: unknown) => error instanceof Error;

export async function fetchHandler<T>(
  url: string,
  options: fetchOptions = {},
): Promise<ActionResponse<T>> {
  const {
    timeout = 5000,
    headers: customHeaders = {},
    ...restOptions
  } = options;

  const controller = new AbortController();

  const id = setTimeout(() => controller.abort(), timeout);

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const headers: HeadersInit = { ...defaultHeaders, ...customHeaders };

  const config: RequestInit = {
    ...restOptions,
    headers,
    signal: controller.signal,
  };

  try {
    const res = await fetch(url, config);

    clearTimeout(id);

    if (!res.ok) throw new RequestError(res.status, `HTTP error ${res.status}`);

    return await res.json();
  } catch (err) {
    const error = isError(err) ? err : new Error("Unknown error");

    if (error.name === "AbortError") logger.warn(`Request to ${url} timed out`);
    else logger.error(`Error fetching ${url}: ${error.message}`);

    return handleError(error) as ActionResponse<T>;
  }
}
