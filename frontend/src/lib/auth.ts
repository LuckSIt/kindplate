import React, { createContext } from "react";
import type { User } from "./types";

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
}

export const authContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isError: false,
    isSuccess: false,
});
