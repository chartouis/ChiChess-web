// src/lib/config.ts
import { env } from '$env/dynamic/public';

export const NURL = env.PUBLIC_NURL;
export const WSNURL = env.PUBLIC_NWSURL;
export const REFRESH_INTERVAL = +env.PUBLIC_REFRESH_INTERVAL;
