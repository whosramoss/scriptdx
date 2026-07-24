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

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);
const originalPath = process.env.PATH;

function mockStdoutWrites(target: string[]): void {
  process.stdout.write = (chunk: string | Uint8Array): boolean => {
    target.push(String(chunk));
    return true;
  };
}

function mockStderrWrites(target: string[]): void {
  process.stderr.write = (chunk: string | Uint8Array): boolean => {
    target.push(String(chunk));
    return true;
  };
}

afterEach(() => {
  process.stdout.write = originalStdoutWrite;
  process.stderr.write = originalStderrWrite;
  if (originalPath === undefined) delete process.env.PATH;
  else process.env.PATH = originalPath;
});

describe("logger and colors", () => {
  it("color helpers include ANSI sequences", () => {
    expect(color.cyan("x")).toContain("\u001b[36m");
    expect(color.cyan.bold("x")).toContain("\u001b[1;36m");
    expect(styles.lightGreen).toBe("1;32");
  });

  it("logger aliases write to stdout", () => {
    const chunks: string[] = [];
    mockStdoutWrites(chunks);

    success("ok");
    error("bad");
    warning("warn");
    info("info");
    debug("debug");

    const output = chunks.join("");
    expect(output).toContain("ok");
    expect(output).toContain("bad");
    expect(output).toContain("warn");
    expect(output).toContain("info");
    expect(output).toContain("debug");
  });

  it("logColor rejects unknown color at runtime", () => {
    expect(() =>
      logColor("notAColor" as "lightGreen", "x", "y"),
    ).toThrow(TypeError);
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
    mockStdoutWrites(chunks);

    await simpleLoading(1, 0);

    const output = chunks.join("");
    expect(output).toContain("\n");
    expect(["|", "/", "-", "\\"].some((frame) => output.includes(frame))).toBe(
      true,
    );
  });

  it("linearLoading rotates full text and ends line", async () => {
    const chunks: string[] = [];
    mockStdoutWrites(chunks);

    await linearLoading("abc", 1, 0);

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
    mockStdoutWrites(chunks);

    void simpleLoading(0, 20);

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
    );
    expect(called).toBe(true);
  });

  it("runMenuByIndex ignores invalid index", async () => {
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
    );
    expect(called).toBe(false);
  });

  it("runMenuByIndex ignores negative index", async () => {
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
    );
    expect(called).toBe(false);
  });

  it("runStep returns true when task succeeds", async () => {
    const out: string[] = [];
    const err: string[] = [];
    mockStdoutWrites(out);
    mockStderrWrites(err);

    const result = await runStep(async () => Promise.resolve(), "step ok");
    expect(result).toBe(true);
    expect(out.join("")).toContain("step ok");
  });

  it("runStep returns false when task fails", async () => {
    const out: string[] = [];
    const err: string[] = [];
    mockStdoutWrites(out);
    mockStderrWrites(err);

    const result = await runStep(
      async () => Promise.reject(new Error("fail")),
      "step fail",
    );
    expect(result).toBe(false);
    expect(out.join("")).toContain("step fail");
  });
});

describe("spinner factory", () => {
  it("createSpinner start/stop writes final line", () => {
    const chunks: string[] = [];
    const stream = {
      write: (value: string): boolean => {
        chunks.push(value);
        return true;
      },
    } as NodeJS.WriteStream;

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
    const stream = {
      write: (value: string): boolean => {
        chunks.push(value);
        return true;
      },
    } as NodeJS.WriteStream;
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
    const stream = {
      write: (value: string): boolean => {
        chunks.push(value);
        return true;
      },
    } as NodeJS.WriteStream;
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
    const stream = {
      write: (value: string): boolean => {
        chunks.push(value);
        return true;
      },
    } as NodeJS.WriteStream;
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
});
