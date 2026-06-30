import { describe, expect, it } from "vitest";

import {
  normalizeInsightBreakdown,
  normalizeDemographicBreakdowns,
  shortCaption,
  sumInsightValues,
  toTopFiveBreakdown,
} from "./normalize";

describe("instagram normalizers", () => {
  describe("sumInsightValues", () => {
    it("sums numeric insight values across period values and total_value", () => {
      expect(
        sumInsightValues({
          data: [
            { name: "reach", values: [{ value: 10 }, { value: "5" }] },
            { name: "reach", total_value: { value: 7 } },
          ],
        }),
      ).toBe(22);
    });

    it("ignores missing or non numeric values", () => {
      expect(
        sumInsightValues({
          data: [
            { values: [{ value: "nope" }, { value: null }, {}] },
            { total_value: { value: { nested: 1 } } },
          ],
        }),
      ).toBe(0);
    });
  });

  describe("toTopFiveBreakdown", () => {
    it("returns the five largest entries sorted by value", () => {
      expect(
        toTopFiveBreakdown({
          "18-24": 20,
          "25-34": 50,
          "35-44": 10,
          "45-54": 5,
          "55-64": 2,
          "65+": 1,
        }),
      ).toEqual([
        { label: "25-34", value: 50 },
        { label: "18-24", value: 20 },
        { label: "35-44", value: 10 },
        { label: "45-54", value: 5 },
        { label: "55-64", value: 2 },
      ]);
    });

    it("filters zero and invalid values", () => {
      expect(
        toTopFiveBreakdown({
          SaoPaulo: 12,
          Empty: 0,
          Bad: Number.NaN,
        }),
      ).toEqual([{ label: "SaoPaulo", value: 12 }]);
    });
  });

  describe("normalizeInsightBreakdown", () => {
    it("extracts total_value breakdowns from Meta insight responses", () => {
      expect(
        normalizeInsightBreakdown(
          {
            data: [
              {
                name: "views",
                total_value: {
                  breakdowns: [
                    {
                      dimension_keys: ["follow_type"],
                      results: [
                        { dimension_values: ["FOLLOWER"], value: 370 },
                        { dimension_values: ["NON_FOLLOWER"], value: 630 },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          "views",
        ),
      ).toEqual([
        { label: "NON_FOLLOWER", value: 630 },
        { label: "FOLLOWER", value: 370 },
      ]);
    });
  });

  describe("shortCaption", () => {
    it("trims captions to a readable length", () => {
      expect(shortCaption("a".repeat(170), 80)).toBe(`${"a".repeat(77)}...`);
    });

    it("collapses whitespace and preserves short captions", () => {
      expect(shortCaption("  primeira\n\nlinha   segunda  ", 80)).toBe(
        "primeira linha segunda",
      );
    });
  });

  describe("normalizeDemographicBreakdowns", () => {
    it("normalizes total_value breakdowns returned by follower_demographics", () => {
      const demographics = normalizeDemographicBreakdowns({
        data: [
          {
            name: "follower_demographics",
            total_value: {
              breakdowns: [
                {
                  dimension_keys: ["age"],
                  results: [
                    { dimension_values: ["25-34"], value: 40 },
                    { dimension_values: ["18-24"], value: 25 },
                  ],
                },
                {
                  dimension_keys: ["city"],
                  results: [{ dimension_values: ["Sao Paulo"], value: 70 }],
                },
              ],
            },
          },
        ],
      });

      expect(demographics.age).toEqual([
        { label: "25-34", value: 40 },
        { label: "18-24", value: 25 },
      ]);
      expect(demographics.city).toEqual([{ label: "Sao Paulo", value: 70 }]);
    });

    it("accepts flat breakdown maps defensively", () => {
      expect(
        normalizeDemographicBreakdowns({
          gender: { F: 80, M: 20 },
          country: [{ label: "BR", value: 99 }],
        }),
      ).toMatchObject({
        gender: [
          { label: "F", value: 80 },
          { label: "M", value: 20 },
        ],
        country: [{ label: "BR", value: 99 }],
      });
    });
  });
});
