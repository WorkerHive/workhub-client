import { Context, createContext } from "react";
import { WorkhubClient } from ".";

declare global {
    interface Window {
        hubClient? :WorkhubClient
    }
}

export const HubContext : Context<[WorkhubClient | null, any, Boolean, Error | null]> = createContext<[WorkhubClient | null, any, Boolean, Error | null]>([null, {}, false, null])
