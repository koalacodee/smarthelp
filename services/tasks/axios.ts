import { env } from "next-runtime-env";
import { createAxiosInstance } from "../axios";

export default createAxiosInstance(`${env("NEXT_PUBLIC_API_URL")}/v2`);
