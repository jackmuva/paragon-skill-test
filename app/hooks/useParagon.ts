"use client";

import { useState, useEffect, useCallback } from "react";
import {
  paragon,
  AuthenticatedConnectUser,
  IntegrationMetadata,
  SDK_EVENT,
} from "@useparagon/connect";

interface UseParagonReturn {
  user: AuthenticatedConnectUser | null;
  integrations: IntegrationMetadata[];
  isLoading: boolean;
  error: string | null;
  connect: (integrationType: string) => void;
}

export function useParagon(): UseParagonReturn {
  const [user, setUser] = useState<AuthenticatedConnectUser | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initParagon() {
      try {
        const projectId = process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID;

        if (!projectId) {
          throw new Error("Paragon Project ID not configured");
        }

        // Fetch the JWT token from our API route
        const response = await fetch("/api/paragon-token");
        if (!response.ok) {
          throw new Error("Failed to fetch Paragon token");
        }

        const { token } = await response.json();

        // Authenticate with Paragon
        await paragon.authenticate(projectId, token);

        // Get the authenticated user
        const authenticatedUser = paragon.getUser();
        if (authenticatedUser.authenticated) {
          setUser(authenticatedUser);
        }

        // Get integration metadata
        const metadata = paragon.getIntegrationMetadata();
        setIntegrations(metadata);

        // Subscribe to connection state changes
        paragon.subscribe(SDK_EVENT.ON_INTEGRATION_INSTALL, () => {
          const updatedUser = paragon.getUser();
          if (updatedUser.authenticated) {
            setUser(updatedUser);
          }
        });

        paragon.subscribe(SDK_EVENT.ON_INTEGRATION_UNINSTALL, () => {
          const updatedUser = paragon.getUser();
          if (updatedUser.authenticated) {
            setUser(updatedUser);
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize Paragon");
        console.error("Paragon initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initParagon();
  }, []);

  const connect = useCallback((integrationType: string) => {
    paragon.connect(integrationType, {});
  }, []);

  return {
    user,
    integrations,
    isLoading,
    error,
    connect,
  };
}
