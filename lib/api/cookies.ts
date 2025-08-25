// import Cookies from "js-cookie";
// import { cookies as serverCookies } from "next/headers";

export async function getCookie(name: string): Promise<string | undefined> {
  // Detect if running on server or client
  if (typeof window === "undefined") {
    // Server side
    const { cookies } = await import("next/headers");
    return (await cookies()).get(name)?.value;
  } else {
    // Client side
    const Cookies = await import("js-cookie");
    return Cookies.default.get(name);
  }
}

export async function setCookie(name: string, value: string) {
  if (typeof window === "undefined") {
    // Server side
    const { cookies } = await import("next/headers");
    (await cookies()).set(name, value);
  } else {
    // Client side
    const Cookies = await import("js-cookie");
    Cookies.default.set(name, value);
  }
}
