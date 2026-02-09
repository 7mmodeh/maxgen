"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError(props: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          margin: 0,
        }}
      >
        <div style={{ maxWidth: 760, margin: "48px auto", padding: 16 }}>
          <h1 style={{ fontSize: 22, margin: "0 0 10px" }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.85, margin: "0 0 14px" }}>
            An unexpected error occurred while rendering this page.
          </p>

          {props.error?.digest ? (
            <p style={{ fontSize: 12, opacity: 0.7, margin: "0 0 18px" }}>
              Error ID: {props.error.digest}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => props.reset()}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
