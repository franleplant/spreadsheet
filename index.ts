export type CellData = string | number | `=${string}`;
export type CellType = "string" | "number" | "formula";

export type Cell =
  | {
      type: "string";
      data: string;
      id: CellId;
    }
  | {
      type: "number";
      data: number;
      id: CellId;
    }
  | {
      type: "formula";
      formula: `=${string}`;
      data: string;
      id: CellId;
    };

// `${string}${number}`
export type CellId = string;
export type SpreadsheetMap = Record<CellId, Cell>;

export class Spreadsheet {
  cells: SpreadsheetMap = {};

  constructor() {
    this.setCell("Z100", "");
  }

  setCell(id: CellId, data: CellData): void {
    if (typeof data === "number") {
      this.cells[id] = {
        type: "number",
        data,
        id,
      };
      this.recalculateFormulas();
      return;
    }
    if (typeof data === "string" && data.startsWith("=")) {
      this.cells[id] = {
        type: "formula",
        formula: data as `=${string}`,
        data: "",
        id,
      };
      this.recalculateFormulas();
      return;
    }

    if (typeof data === "string") {
      this.cells[id] = {
        type: "string",
        data,
        id,
      };
      this.recalculateFormulas();
      return;
    }

    throw new Error("invalid type");
  }

  getCell(id: CellId): Cell | undefined {
    return this.cells[id];
  }

  recalculateFormulas(): void {
    for (let [_, cell] of Object.entries(this.cells)) {
      if (cell.type !== "formula") {
        continue;
      }

      cell.data = this.calcFormula(cell.formula);
    }
  }

  calcFormula(formula: `=${string}`): string {
    try {
      const [cellId1, cellId2] = formula.replace("=", "").split(/\*|\+/);
      const cell1 = this.cells[cellId1];
      const cell2 = this.cells[cellId2];
      if (!cell1 || !cell2) {
        throw new Error("missing cells");
      }
      if (cell1.type !== "number" || cell2.type !== "number") {
        throw new Error("missing cells");
      }

      if (formula.includes("*")) {
        return (cell1.data * cell2.data).toString();
      } else if (formula.includes("+")) {
        return (cell1.data + cell2.data).toString();
      } else {
        throw new Error("op not supported duh");
      }
    } catch (err) {
      console.error("ups ", err);
      return "";
    }
  }
}

const a = new Spreadsheet();
console.log("AAAA", a.cells);
a.setCell("A1", 1);
a.setCell("A2", 2);
a.setCell("A3", `=A1+A2`);

console.log("BBBB", a.cells);

a.setCell("A2", 3);
console.log("CCCC", a.cells);
