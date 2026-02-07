import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

export const auth = betterAuth({
    
    database: mongodbAdapter(mongoose.connection.db as any),
    
    baseURL: "http://localhost:5000", // ✅ BetterAuth will add /api/auth automatically
    trustedOrigins: [
        "http://localhost:5000", // Backend (for direct API calls)
        "http://localhost:3000", // Frontend (for browser requests)
        "http://localhost:5173"  // Vite dev server (if used)
    ],
    
    emailAndPassword: {  
        enabled: true,
    },
    
    user: {
        modelName: "users", 
    },
    session: {
        modelName: "sessions",
    },
    verification: {
        modelName: "verifications",
    }
});