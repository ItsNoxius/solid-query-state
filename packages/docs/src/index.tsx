/* @refresh reload */
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import "./index.css";
import App from "./App.tsx";
import { Hero } from "./components/Hero";
import { Installation } from "./sections/Installation";
import { Usage } from "./sections/Usage";
import { Playground } from "./sections/Playground";
import { TestSuite } from "./sections/TestSuite";

const root = document.getElementById("root");
render(
    () => (
        <Router root={App}>
            <Route path="/" component={Hero} />
            <Route path="/installation" component={Installation} />
            <Route path="/usage" component={Usage} />
            <Route path="/playground" component={Playground} />
            <Route path="/playground/:demo" component={Playground} />
            <Route path="/tests" component={TestSuite} />
        </Router>
    ),
    root!,
);
