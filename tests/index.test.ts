import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  color,
  createSpinner,
  debug,
  error,
  hasTool,
  info,
  isLinux,
  isWindows,
  linearLoading,
  logColor,
  logSection,
  logTopic,
  runMenuByIndex,
  runStep,
  showScriptTitle,
  showTable,
  showTableWithBorders,
  simpleLoading,
  styles,
  success,
  summarizeToolValidation,
  warning,
} from "../src/index.js";
import { getOutputStream } from "../src/output.js";

const originalPath = process.env.PATH;

function mockStream(target: string[]): NodeJS.WritableStream {
  return {
    write: (chunk: string | Uint8Array): boolean => {
      target.push(String(chunk));
      return true;
    },
  } as NodeJS.WriteStream;
}

afterEach(() => {
  if (originalPath === undefined) delete process.env.PATH;
  else process.env.PATH = originalPath;
});

describe("logger and colors", () => {
  it("color helpers include ANSI sequences", () => {
    expect(color.cyan("x")).toContain("\u001b[36m");
    expect(color.cyan.bold("x")).toContain("\u001b[1;36m");
    expect(styles.lightGreen).toBe("1;32");
  });

  it("logger aliases write to the given stream", () => {
    const chunks: string[] = [];
    const stream = mockStream(chunks);

    success("ok", { stream });
    error("bad", { stream });
    warning("warn", { stream });
    info("info", { stream });
    debug("debug", { stream });

    const output = chunks.join("");
    expect(output).toContain("ok");
    expect(output).toContain("bad");
    expect(output).toContain("warn");
    expect(output).toContain("info");
    expect(output).toContain("debug");
  });

  it("logColor writes to a custom stream", () => {
    const chunks: string[] = [];
    const stream = mockStream(chunks);

    logColor("lightGreen", "✔", "Build complete", { stream });

    expect(chunks.join("")).toContain("Build complete");
  });

  it("logSection and logTopic write to a custom stream", () => {
    const chunks: string[] = [];
    const stream = mockStream(chunks);

    logSection("Deploy", "Production", { stream });
    logTopic("Migrations", { stream });

    const output = chunks.join("");
    expect(output).toContain("Deploy");
    expect(output).toContain("Production");
    expect(output).toContain("Migrations");
  });

  it("writes to independent streams without mixing output", () => {
    const first: string[] = [];
    const second: string[] = [];

    success("one", { stream: mockStream(first) });
    success("two", { stream: mockStream(second) });

    expect(first.join("")).toContain("one");
    expect(second.join("")).toContain("two");
    expect(first.join("")).not.toContain("two");
    expect(second.join("")).not.toContain("one");
  });

  it("logColor rejects unknown color at runtime", () => {
    expect(() =>
      logColor("notAColor" as "lightGreen", "x", "y"),
    ).toThrow(TypeError);
  });
});

describe("getOutputStream", () => {
  it("defaults to process.stdout", () => {
    expect(getOutputStream()).toBe(process.stdout);
  });

  it("uses an explicit fallback", () => {
    expect(getOutputStream(undefined, process.stderr)).toBe(process.stderr);
  });

  it("returns the provided stream", () => {
    const stream = mockStream([]);
    expect(getOutputStream({ stream })).toBe(stream);
  });
});

describe("system", () => {
  it("isLinux/isWindows reflect current runtime", () => {
    expect(isLinux()).toBe(process.platform === "linux");
    expect(isWindows()).toBe(process.platform === "win32");
  });
});

describe("loading", () => {
  it("simpleLoading writes spinner frames and newline", async () => {
    const chunks: string[] = [];

    await simpleLoading(1, 0, { stream: mockStream(chunks) });

    const output = chunks.join("");
    expect(output).toContain("\n");
    expect(["|", "/", "-", "\\"].some((frame) => output.includes(frame))).toBe(
      true,
    );
  });

  it("linearLoading rotates full text and ends line", async () => {
    const chunks: string[] = [];

    await linearLoading("abc", 1, 0, { stream: mockStream(chunks) });

    const output = chunks.join("");
    expect(output).toContain("abc");
    expect(output).toContain("bca");
    expect(output).toContain("cab");
    expect(output.endsWith("\n")).toBe(true);
  });

  it("simpleLoading rejects negative delayMs", async () => {
    await expect(simpleLoading(1, -1)).rejects.toThrow(RangeError);
  });

  it("linearLoading rejects negative delayMs", async () => {
    await expect(linearLoading("x", 1, -5)).rejects.toThrow(RangeError);
  });

  it("simpleLoading(0) keeps cycling frames indefinitely", async () => {
    vi.useFakeTimers();
    const chunks: string[] = [];

    void simpleLoading(0, 20, { stream: mockStream(chunks) });

    // 3 full cycles × 4 frames × 20ms = 240ms
    await vi.advanceTimersByTimeAsync(240);

    expect(chunks.filter((c) => c.startsWith("\r")).length).toBeGreaterThanOrEqual(
      12,
    );
    expect(chunks.some((c) => c === "\n")).toBe(false);

    vi.clearAllTimers();
    vi.useRealTimers();
  });
});

describe("menu and step", () => {
  it("runMenuByIndex executes selected callback", async () => {
    const chunks: string[] = [];
    let called = false;
    await runMenuByIndex(
      [
        {
          label: "One",
          run: () => {
            called = true;
          },
        },
      ],
      0,
      { stream: mockStream(chunks) },
    );
    expect(called).toBe(true);
    expect(chunks.join("")).toContain("Selected: One");
  });

  it("runMenuByIndex ignores invalid index", async () => {
    const chunks: string[] = [];
    let called = false;
    await runMenuByIndex(
      [
        {
          label: "One",
          run: () => {
            called = true;
          },
        },
      ],
      5,
      { stream: mockStream(chunks) },
    );
    expect(called).toBe(false);
    expect(chunks.join("")).toContain("Invalid menu index");
  });

  it("runMenuByIndex ignores negative index", async () => {
    const chunks: string[] = [];
    let called = false;
    await runMenuByIndex(
      [
        {
          label: "One",
          run: () => {
            called = true;
          },
        },
      ],
      -1,
      { stream: mockStream(chunks) },
    );
    expect(called).toBe(false);
    expect(chunks.join("")).toContain("Invalid menu index");
  });

  it("runStep returns true when task succeeds", async () => {
    const chunks: string[] = [];

    const result = await runStep(async () => Promise.resolve(), "step ok", {
      stream: mockStream(chunks),
    });
    expect(result).toBe(true);
    expect(chunks.join("")).toContain("step ok");
  });

  it("runStep returns false when task fails", async () => {
    const chunks: string[] = [];

    const result = await runStep(
      async () => Promise.reject(new Error("fail")),
      "step fail",
      { stream: mockStream(chunks) },
    );
    expect(result).toBe(false);
    expect(chunks.join("")).toContain("step fail");
  });
});

describe("spinner factory", () => {
  it("createSpinner start/stop writes final line", () => {
    const chunks: string[] = [];
    const stream = mockStream(chunks);

    const spinner = createSpinner({ stream, intervalMs: 10 });
    spinner.start("running");
    spinner.stop("done");

    expect(chunks.some((line) => line.includes("done"))).toBe(true);
  });
});

describe("createSpinner - ciclos completos", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("anima frames ao longo do tempo", () => {
    const chunks: string[] = [];
    const stream = mockStream(chunks);
    const spinner = createSpinner({ stream, intervalMs: 80 });

    spinner.start("loading");
    vi.advanceTimersByTime(240);
    spinner.stop();

    expect(chunks.filter((c) => c.startsWith("\r")).length).toBeGreaterThanOrEqual(
      3,
    );
  });

  it("start() ignorado se já está rodando", () => {
    const chunks: string[] = [];
    const stream = mockStream(chunks);
    const spinner = createSpinner({ stream, intervalMs: 80 });

    spinner.start("first");
    spinner.start("second");
    vi.advanceTimersByTime(80);
    spinner.stop();

    expect(chunks.some((c) => c.includes("first"))).toBe(true);
    expect(chunks.some((c) => c.includes("second"))).toBe(false);
  });

  it("stop() sem finalLine apenas limpa a linha", () => {
    const chunks: string[] = [];
    const stream = mockStream(chunks);
    const spinner = createSpinner({ stream, intervalMs: 80 });

    spinner.start("running");
    vi.advanceTimersByTime(80);
    spinner.stop();

    expect(chunks.some((c) => c === "\r\x1b[K")).toBe(true);
    expect(chunks.some((c) => c.endsWith("\n"))).toBe(false);
  });
});

describe("table", () => {
  it("showTable renders header and rows", () => {
    const table = showTable(["Name", "Age"], [["Ana", "20"]]);
    expect(table).toContain("Name");
    expect(table).toContain("Ana");
  });

  it("showTable returns empty string for empty header", () => {
    expect(showTable([], [["a"]])).toBe("");
  });

  it("showTable pads short rows to header length", () => {
    const table = showTable(["A", "B", "C"], [["only"]]);
    const lines = table.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[2]!.length).toBe(lines[0]!.length);
  });

  it("showTable default column width stays 24", () => {
    const table = showTable(["A"], [["x"]]);
    const lines = table.split("\n");
    expect(lines[0]!.length).toBe(24);
    expect(lines[1]).toBe("-".repeat(24));
  });

  it("showTable auto widths follow content", () => {
    const table = showTable(
      ["ID", "Name"],
      [["1", "Ana"]],
      { columnWidth: "auto" },
    );
    const lines = table.split("\n");
    expect(lines[0]).toBe("ID Name");
    expect(lines[1]).toBe("-- ----");
    expect(lines[2]!.length).toBe(lines[0]!.length);
  });

  it("showTable auto widths honor minWidth", () => {
    const table = showTable(["ID"], [["1"]], {
      columnWidth: "auto",
      minWidth: 10,
    });
    const lines = table.split("\n");
    expect(lines[0]!.length).toBe(10);
    expect(lines[1]).toBe("-".repeat(10));
  });

  it("showTable accepts a custom numeric width", () => {
    const table = showTable(["A"], [["x"]], { columnWidth: 8 });
    const lines = table.split("\n");
    expect(lines[0]!.length).toBe(8);
    expect(lines[1]).toBe("-".repeat(8));
  });

  it("showTableWithBorders renders borders", () => {
    const table = showTableWithBorders(["Name", "Age"], [["Bob", "30"]]);
    expect(table).toContain("+");
    expect(table).toContain("|");
    expect(table).toContain("Bob");
  });
});

describe("validations", () => {
  it("summarizeToolValidation separates ok and fail", () => {
    const summary = summarizeToolValidation({ git: true, docker: false });
    expect(summary.ok).toEqual(["git"]);
    expect(summary.fail).toEqual(["docker"]);
  });

  it("hasTool returns false for empty tool name", () => {
    expect(hasTool("")).toBe(false);
  });
});

describe("font", () => {
  it("showScriptTitle renders multi-line ASCII", () => {
    const title = showScriptTitle("Ab");
    const lines = title.split("\n");
    expect(lines.length).toBe(10);
    expect(title.length).toBeGreaterThan(0);
  });

  it("showScriptTitle fallback for unmapped characters", () => {
    const title = showScriptTitle("@!");
    const lines = title.split("\n");

    expect(lines).toHaveLength(10);
    expect(lines[0]).toBe("@ !");
    for (let i = 1; i < 10; i += 1) {
      expect(lines[i]).toBe("");
    }
  });

  it("is available from the font entry module", async () => {
    const font = await import("../src/font/index.js");
    expect(font.showScriptTitle("Ab")).toBe(showScriptTitle("Ab"));
  });

  it("allocates the glyph map once and reuses it", async () => {
    const { getFontMap } = await import("../src/font/glyphs.js");
    expect(getFontMap()).toBe(getFontMap());
  });
});
