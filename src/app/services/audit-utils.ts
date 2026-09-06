export interface CardinalityCourses {
  cardinality?: string;
  courses?: string[];
}

// Tokenizes a requirement entry like "CS1131 or (CS1121 and CS1122)" into
// '(' / ')' / 'and' / 'or' / course-code tokens (course codes normalized to
// no whitespace + uppercase; abstract_ identifiers keep their original case).
export function tokenizeEntry(expr: string): string[] {
  const tokens: string[] = [];
  const re = /\(|\)|\bor\b|\band\b|abstract_[A-Za-z0-9%]+|[A-Za-z]{2,4}\s*\d{4}(?:\(C\))?/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(expr)) !== null) {
    const raw = match[0];
    if (raw === '(' || raw === ')') {
      tokens.push(raw);
    } else if (/^(or|and)$/i.test(raw)) {
      tokens.push(raw.toLowerCase());
    } else if (/^abstract_/i.test(raw)) {
      tokens.push(raw);
    } else {
      tokens.push(raw.replace(/\s+/g, '').toUpperCase());
    }
  }
  return tokens;
}

// The atomic course/abstract identifiers referenced by an entry, in order,
// with duplicates removed (skips the 'and'/'or'/paren structural tokens).
export function atomicTokens(entry: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tok of tokenizeEntry(entry)) {
    if (tok === '(' || tok === ')' || tok === 'and' || tok === 'or') {
      continue;
    }
    if (!seen.has(tok)) {
      seen.add(tok);
      result.push(tok);
    }
  }
  return result;
}

// Evaluates one requirement entry's own and/or/paren expression against the
// set of currently placed courses.
export function entrySatisfied(entry: string, placedCourses: string[]): boolean {
  if (placedCourses.includes(entry)) {
    return true;
  }
  const tokens = tokenizeEntry(entry);
  if (tokens.length === 0) {
    return false;
  }
  let pos = 0;
  const peek = () => tokens[pos];
  const parseOr = (): boolean => {
    let value = parseAnd();
    while (peek() === 'or') {
      pos++;
      value = parseAnd() || value;
    }
    return value;
  };
  const parseAnd = (): boolean => {
    let value = parseAtom();
    while (peek() === 'and') {
      pos++;
      value = parseAtom() && value;
    }
    return value;
  };
  const parseAtom = (): boolean => {
    const tok = tokens[pos++];
    if (tok === '(') {
      const value = parseOr();
      if (peek() === ')') {
        pos++;
      }
      return value;
    }
    return placedCourses.includes(tok);
  };
  return parseOr();
}

export function requiredCount(subAudit: CardinalityCourses): number {
  const cardinality = subAudit.cardinality;
  const total = subAudit.courses?.length ?? 0;
  if (!cardinality || cardinality.toUpperCase() === 'ALL') {
    return total;
  }
  const parsed = parseInt(cardinality, 10);
  return isNaN(parsed) ? total : parsed;
}

// How many "units" one entry contributes toward its sub-audit's required
// count. A single atomic entry (e.g. "abstract_TechElective" with no and/or)
// is a repeatable pool — every matching placement counts, which is what lets
// cardinality "3" over a single elective entry be satisfied by 3 separate
// placements of that one category. A compound and/or entry (e.g. "CS1131 or
// (CS1121 and CS1122)") is a single distinct requirement and can only ever
// contribute 0 or 1, however many of its tokens are placed.
export function entrySatisfiedCount(entry: string, placedCourses: string[]): number {
  const tokens = tokenizeEntry(entry);
  if (tokens.length === 1) {
    return placedCourses.filter(c => c === tokens[0]).length;
  }
  return entrySatisfied(entry, placedCourses) ? 1 : 0;
}

export function isSubAuditSatisfied(subAudit: CardinalityCourses, placedCourses: string[]): boolean {
  if (!subAudit.courses) {
    return false;
  }
  const required = requiredCount(subAudit);
  const satisfiedCount = subAudit.courses.reduce((sum, entry) => sum + entrySatisfiedCount(entry, placedCourses), 0);
  return satisfiedCount >= required;
}
