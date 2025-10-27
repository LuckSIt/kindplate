import React, { createContext } from "react";

export const authContext = createContext({
    user: null,
    isLoading: true,
    isError: false,
    isSuccess: false,
});
