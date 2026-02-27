import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { SolidTestingAdapter, withSolidTestingAdapter } from "solid-query-state";

describe("SolidTestingAdapter", () => {
    it("renders children without crashing", () => {
        const { getByTestId } = render(() => (
            <SolidTestingAdapter>
                <div data-testid="child">content</div>
            </SolidTestingAdapter>
        ));
        expect(getByTestId("child").textContent).toBe("content");
    });

    it("accepts searchParams as string", () => {
        const { getByTestId } = render(() => (
            <SolidTestingAdapter searchParams="?a=1">
                <div data-testid="child">ok</div>
            </SolidTestingAdapter>
        ));
        expect(getByTestId("child").textContent).toBe("ok");
    });

    it("accepts searchParams as object", () => {
        const { getByTestId } = render(() => (
            <SolidTestingAdapter searchParams={{ key: "value" }}>
                <div data-testid="child">ok</div>
            </SolidTestingAdapter>
        ));
        expect(getByTestId("child").textContent).toBe("ok");
    });
});

describe("withSolidTestingAdapter", () => {
    it("returns a wrapper component", () => {
        const Wrapper = withSolidTestingAdapter();
        expect(typeof Wrapper).toBe("function");
    });

    it("wrapper renders children", () => {
        const Wrapper = withSolidTestingAdapter({ searchParams: "?x=y" });
        const { getByTestId } = render(() => (
            <Wrapper>
                <div data-testid="child">wrapped</div>
            </Wrapper>
        ));
        expect(getByTestId("child").textContent).toBe("wrapped");
    });
});
