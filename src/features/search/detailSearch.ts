export type SearchDetailSettings = {
  keywords: {
    free: string[];
    title: string[];
    body: string[];
    code: string[];
  };
  tagGroups: string[][];
  user: string;
  organization: string;
  createdAt: { from: string; to: string };
  updatedAt: { from: string; to: string };
  minStocks: string;
};

export const defaultSearchDetailSettings: SearchDetailSettings = {
  keywords: {
    free: [],
    title: [],
    body: [],
    code: [],
  },
  tagGroups: [[]],
  user: "",
  organization: "",
  createdAt: { from: "", to: "" },
  updatedAt: { from: "", to: "" },
  minStocks: "",
};

const quoteIfNeeded = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const escaped = trimmed.replace(/"/g, '\\"');
  return /\s/.test(trimmed) ? `"${escaped}"` : escaped;
};

type DateRangeKey = "createdAt" | "updatedAt";

type Clause = string[];
type CNF = Clause[];

const mergeAnd = (left: CNF, right: CNF): CNF => [...left, ...right];

const distributeOr = (left: CNF, right: CNF): CNF => {
  const result: CNF = [];
  left.forEach((leftClause) => {
    right.forEach((rightClause) => {
      const merged = Array.from(new Set([...leftClause, ...rightClause]));
      result.push(merged);
    });
  });
  return result;
};

const buildGroupCNF = (group: string[]): CNF => {
  let cnf: CNF = [];
  group.forEach((rawTag) => {
    const options = rawTag
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => `tag:${quoteIfNeeded(tag)}`)
      .filter((value) => value !== "tag:");

    if (options.length === 0) {
      return;
    }

    const tokenCNF = [options];
    cnf = cnf.length === 0 ? tokenCNF : mergeAnd(cnf, tokenCNF);
  });

  return cnf;
};

const expressionsToCNF = (groups: string[][]): CNF => {
  const groupCNFs = groups.map(buildGroupCNF).filter((cnf) => cnf.length > 0);

  if (groupCNFs.length === 0) {
    return [];
  }

  let result = groupCNFs[0];
  for (let i = 1; i < groupCNFs.length; i += 1) {
    result = distributeOr(result, groupCNFs[i]);
  }
  return result;
};

const cnfToClauses = (cnf: CNF): string[][] =>
  cnf.map((clause) => clause.filter(Boolean)).filter((clause) => clause.length > 0);

export const buildDetailQuery = (settings: SearchDetailSettings): string => {
  const clauses: string[] = [];
  const keywordGroups: Array<{ prefix: string | null; values: string[] }> = [
    { prefix: null, values: settings.keywords.free },
    { prefix: "title", values: settings.keywords.title },
    { prefix: "body", values: settings.keywords.body },
    { prefix: "code", values: settings.keywords.code },
  ];

  keywordGroups.forEach(({ prefix, values }) => {
    if (values.length === 0) {
      return;
    }
    const transformed = values
      .map((value) => {
        const sanitized = quoteIfNeeded(value);
        if (!sanitized) {
          return "";
        }
        return prefix ? `${prefix}:${sanitized}` : sanitized;
      })
      .filter(Boolean);
    if (transformed.length === 0) {
      return;
    }
    clauses.push(transformed.length > 1 ? `(${transformed.join(" OR ")})` : transformed[0]);
  });

  const tagCNF = expressionsToCNF(settings.tagGroups);
  const tagClauses = cnfToClauses(tagCNF);
  if (tagClauses.length > 0) {
    const seen = new Set<string>();
    tagClauses.forEach((clause) => {
      const values = clause.map((literal) => literal.replace(/^tag:/u, "")).filter(Boolean);
      if (values.length > 0) {
        const key = values.join(",");
        if (!seen.has(key)) {
          clauses.push(`tag:${key}`);
          seen.add(key);
        }
      }
    });
  }

  if (settings.user.trim()) {
    clauses.push(`user:${quoteIfNeeded(settings.user)}`);
  }

  if (settings.organization.trim()) {
    clauses.push(`organization:${quoteIfNeeded(settings.organization)}`);
  }

  const dateKeys: Array<{ key: DateRangeKey; field: "created" | "updated" }> = [
    { key: "createdAt", field: "created" },
    { key: "updatedAt", field: "updated" },
  ];

  dateKeys.forEach(({ key, field }) => {
    const range = settings[key];
    if (range.from) {
      clauses.push(`${field}:>=${range.from}`);
    }
    if (range.to) {
      clauses.push(`${field}:<=${range.to}`);
    }
  });

  if (settings.minStocks) {
    clauses.push(`stocks:>=${settings.minStocks}`);
  }

  return clauses.join(" ").trim();
};
