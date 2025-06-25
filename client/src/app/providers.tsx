"use client";
// Used to wrap any providers that are needed for the app
// Needed for Next.js
import StoreProvider from "@/state/redux";
import { Authenticator } from "@aws-amplify/ui-react";
import Auth from "./(auth)/authProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <StoreProvider>
            <Authenticator.Provider>
                <Auth>
                    {children}
                </Auth>
            </Authenticator.Provider>
        </StoreProvider>
    )    
}

export default Providers;