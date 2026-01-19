import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./app/root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    return React.createElement(
      "div",
      {
        style: {
          padding: "20px",
          margin: "20px",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          backgroundColor: "#fff",
        },
      },
      React.createElement(
        "h2",
        { style: { color: "#d32f2f", marginTop: 0 } },
        "Erro no módulo de Transações"
      ),
      React.createElement(
        "p",
        { style: { color: "#666" } },
        err?.message || "Ocorreu um erro inesperado"
      ),
      React.createElement(
        "button",
        {
          onClick: () => window.location.reload(),
          style: {
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          },
        },
        "Recarregar Página"
      )
    );
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
