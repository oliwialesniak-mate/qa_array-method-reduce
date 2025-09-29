'use strict'

const { reduce } = require("./reduce");

describe("reduce2", () => {
  beforeAll(() => {
    // attach our custom reduce implementation
    Array.prototype.reduce2 = reduce; // eslint-disable-line
  });

  afterAll(() => {
    delete Array.prototype.reduce2;
  });

  it("sums an array with an initial value", () => {
    const result = [1, 2, 3, 4].reduce2((acc, val) => acc + val, 0);
    expect(result).toBe(10);
  });

  it("sums an array without an initial value", () => {
    const result = [1, 2, 3, 4].reduce2((acc, val) => acc + val);
    expect(result).toBe(10);
  });

  it("concatenates strings", () => {
    const result = ["a", "b", "c"].reduce2((acc, val) => acc + val, "");
    expect(result).toBe("abc");
  });

  it("builds a frequency map", () => {
    const result = ["a", "b", "a", "c", "b"].reduce2((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    expect(result).toEqual({ a: 2, b: 2, c: 1 });
  });

  it("provides index and array arguments to callback", () => {
    const arr = [10, 20, 30];
    const calls = [];
    arr.reduce2((acc, val, idx, src) => {
      calls.push([val, idx, src]);
      return acc + val;
    }, 0);

    expect(calls[0][1]).toBe(0);
    expect(calls[1][1]).toBe(1);
    expect(calls[2][1]).toBe(2);
    expect(calls[0][2]).toBe(arr);
  });

  it("throws on empty array without initial value", () => {
    expect(() => [].reduce2((acc, val) => acc + val)).toThrow();
  });

  it("returns the initial value on empty array with initial value", () => {
    const result = [].reduce2((acc, val) => acc + val, 42);
    expect(result).toBe(42);
  });

  it("flattens an array of arrays", () => {
    const result = [[1, 2], [3, 4], [5]].reduce2((acc, val) => acc.concat(val), []);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
});
