import { Context, createContext } from "react";
import { WorkhubClient } from ".";

declare global {
    interface Window {
        hubClient? :WorkhubClient
    }
}

export const HubContext : Context<[WorkhubClient | null, Boolean, Error | null]> = createContext<[WorkhubClient | null, Boolean, Error | null]>([null, false, null])
