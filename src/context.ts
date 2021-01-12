import { Context, createContext } from "react";
import { WorkhubClient } from ".";

declare global {
    interface Window {
        hubClient? :WorkhubClient
    }
}

export const HubContext : Context<[WorkhubClient | null, Error | null]> = createContext<[WorkhubClient | null, Error | null]>([null, null])
