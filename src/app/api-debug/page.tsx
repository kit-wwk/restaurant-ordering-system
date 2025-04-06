"use client";

import { useEffect, useState } from "react";
import { checkApiHealth, getApiUrl } from "@/lib/apiDebug";
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  CircularProgress,
} from "@mui/material";

interface ApiCheckResult {
  ok: boolean;
  status?: number;
  duration?: number;
  error?: unknown;
  data?: Record<string, unknown>;
}

export default function ApiDebugPage() {
  const [healthCheckResult, setHealthCheckResult] =
    useState<ApiCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState("");

  useEffect(() => {
    setApiBaseUrl(getApiUrl());
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      const result = await checkApiHealth();
      setHealthCheckResult(result as ApiCheckResult);
    } catch (error) {
      setHealthCheckResult({ ok: false, error });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        API Diagnostics
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Configuration
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            <strong>API Base URL:</strong>{" "}
            {apiBaseUrl || "(using relative paths)"}
          </Typography>
          <Typography variant="body1">
            <strong>NODE_ENV:</strong> {process.env.NODE_ENV || "not set"}
          </Typography>
          <Typography variant="body1">
            <strong>NEXT_PUBLIC_API_URL:</strong>{" "}
            {process.env.NEXT_PUBLIC_API_URL || "not set"}
          </Typography>
          <Typography variant="body1">
            <strong>NEXT_PUBLIC_VERCEL_URL:</strong>{" "}
            {process.env.NEXT_PUBLIC_VERCEL_URL || "not set"}
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Health Check
        </Typography>

        <Button
          variant="contained"
          onClick={runHealthCheck}
          disabled={isChecking}
          sx={{ mb: 2 }}
        >
          {isChecking ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Run Health Check"
          )}
        </Button>

        {healthCheckResult && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="h6"
              color={healthCheckResult.ok ? "success.main" : "error.main"}
            >
              Status: {healthCheckResult.ok ? "OK" : "Failed"}
            </Typography>

            {healthCheckResult.duration && (
              <Typography variant="body1">
                Response Time: {healthCheckResult.duration}ms
              </Typography>
            )}

            {healthCheckResult.status && (
              <Typography variant="body1">
                HTTP Status: {healthCheckResult.status}
              </Typography>
            )}

            {healthCheckResult.error && (
              <Typography variant="body1" color="error.main">
                Error:{" "}
                {typeof healthCheckResult.error === "object"
                  ? JSON.stringify(healthCheckResult.error, null, 2)
                  : String(healthCheckResult.error)}
              </Typography>
            )}

            {healthCheckResult.data && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">Response Data:</Typography>
                <pre
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "4px",
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(healthCheckResult.data, null, 2)}
                </pre>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Common API Routes
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button variant="outlined" href="/api/health" target="_blank">
            /api/health
          </Button>
          <Button
            variant="outlined"
            href="/api/admin/restaurant-profile"
            target="_blank"
          >
            /api/admin/restaurant-profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
