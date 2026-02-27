/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App";
import { QueryStateAdapter } from "solid-query-state";

const root = document.getElementById("root");

render(
  () => (
    <QueryStateAdapter>
      <App />
    </QueryStateAdapter>
  ),
  root!
);
