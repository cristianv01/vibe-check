"use client";
// Used to wrap any providers that are needed for the app
// Needed for Next.js
import StoreProvider from "@/state/redux";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <StoreProvider>
            {children}
        </StoreProvider>
    )    
}

export default Providers;