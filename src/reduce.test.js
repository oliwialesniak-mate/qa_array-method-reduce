const { reduce } = require("./reduce");

describe("reduce2", () => {
  beforeAll(() => {
    Array.prototype.reduce2 = reduce; // eslint-disable-line
  });

  afterAll(() => {
    delete Array.prototype.reduce2;
  });

  describe("basic behavior", () => {
    it("sums with initial value, checks first callback args", () => {
      const calls = [];
      const result = [1, 2, 3].reduce2((acc, curr, idx, arr) => {
        calls.push([acc, curr, idx, arr]);
        return acc + curr;
      }, 0);

      expect(result).toBe(6);
      expect(calls.length).toBe(3);
      expect(calls[0][0]).toBe(0); // acc === initialValue
      expect(calls[0][1]).toBe(1); // curr === first element
      expect(calls[0][2]).toBe(0); // index === 0
    });

    it("sums without initial value, checks first callback args", () => {
      const calls = [];
      const result = [1, 2, 3].reduce2((acc, curr, idx, arr) => {
        calls.push([acc, curr, idx, arr]);
        return acc + curr;
      });

      expect(result).toBe(6);
      expect(calls.length).toBe(2);
      expect(calls[0][0]).toBe(1); // acc === first element
      expect(calls[0][1]).toBe(2); // curr === second element
      expect(calls[0][2]).toBe(1); // index === 1
    });

    it("returns initial value on empty array with initialValue and never calls callback", () => {
      const cb = jest.fn();
      const result = [].reduce2(cb, 42);
      expect(result).toBe(42);
      expect(cb).not.toHaveBeenCalled();
    });

    it("throws TypeError on empty array without initialValue", () => {
      expect(() => [].reduce2((a, b) => a + b)).toThrow(TypeError);
    });

    it("concatenates strings", () => {
      const result = ["a", "b", "c"].reduce2((acc, val) => acc + val, "");
      expect(result).toBe("abc");
    });
  });

  describe("edge cases", () => {
    it("handles single-element array without initialValue", () => {
      const result = [5].reduce2((acc, val) => acc + val);
      expect(result).toBe(5);
    });

    it("handles single-element array with initialValue", () => {
      const calls = [];
      const result = [5].reduce2((acc, val, idx) => {
        calls.push([acc, val, idx]);
        return acc + val;
      }, 10);
      expect(result).toBe(15);
      expect(calls.length).toBe(1);
      expect(calls[0]).toEqual([10, 5, 0]);
    });

    it("skips holes in sparse arrays", () => {
      const arr = [1, , 3]; // hole at index 1
      const calls = [];
      const result = arr.reduce2((acc, val, idx) => {
        calls.push([val, idx]);
        return acc + (val || 0);
      }, 0);

      expect(result).toBe(4);
      expect(calls).toEqual([[1, 0], [3, 2]]);
    });

    it("uses length snapshot, ignores pushed values", () => {
      const arr = [1, 2];
      const result = arr.reduce2((acc, val, idx, src) => {
        if (idx === 0) src.push(99);
        return acc + val;
      }, 0);

      expect(result).toBe(3);
      expect(arr).toEqual([1, 2, 99]); // array mutated but not traversed
    });

    it("ignores prototype numeric properties", () => {
      Array.prototype[2] = 100; // eslint-disable-line
      const arr = [1, 2];
      const result = arr.reduce2((acc, val) => acc + val, 0);
      expect(result).toBe(3);
      delete Array.prototype[2];
    });

    it("does not mutate input array", () => {
      const arr = [1, 2, 3];
      arr.reduce2((acc, val) => acc + val, 0);
      expect(arr).toEqual([1, 2, 3]);
    });

    it("handles undefined and null elements as values", () => {
      const arr = [undefined, null, 1];
      const result = arr.reduce2(
        (acc, val) => acc.concat([val]),
        []
      );
      expect(result).toEqual([undefined, null, 1]);
    });

    it("propagates errors thrown in callback", () => {
      expect(() =>
        [1, 2].reduce2(() => {
          throw new Error("boom");
        }, 0)
      ).toThrow("boom");
    });

    it("throws TypeError when called on null/undefined", () => {
      const cb = (a, b) => a + b;
      expect(() => reduce.call(null, cb, 0)).toThrow(TypeError);
      expect(() => reduce.call(undefined, cb, 0)).toThrow(TypeError);
    });
  });
});
