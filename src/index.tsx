import { Spin } from "@douyinfe/semi-ui";
import { bitable } from "@lark-base-open/js-sdk";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import i18n from "./locales/i18n";

/**
 * LoadApp component for exporting table data to Markdown format.
 */
const LoadApp = () => {
  // State variables
  const [isReady, setIsReady] = useState(false);

  // Initialize the component
  useEffect(() => {
    const f = async () => {
      // Fetch active table data asynchronously
      await bitable.base.getActiveTable();
      setIsReady(true);
    };
    f();
  }, []);

  // Render loading screen if not ready
  if (!isReady) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div>
          <Spin size="middle" />
        </div>
        <div>{i18n.t("initializingText")}</div>
      </div>
    );
  }

  // Render the main component
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <h4>{i18n.t("title")}</h4>
    </div>
  );
};

// Render the component to the root element
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LoadApp />
  </React.StrictMode>
);
