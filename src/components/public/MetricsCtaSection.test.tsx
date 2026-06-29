import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricsCtaSection } from "./MetricsCtaSection";
import { siteContent } from "../../lib/content";

describe("MetricsCtaSection", () => {
  it("renders the metrics CTA copy from centralized content", () => {
    render(<MetricsCtaSection />);

    expect(screen.getByText(siteContent.metricsCta.eyebrow)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: siteContent.metricsCta.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(siteContent.metricsCta.body)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: siteContent.metricsCta.buttonLabel }),
    ).toBeInTheDocument();
  });
});
