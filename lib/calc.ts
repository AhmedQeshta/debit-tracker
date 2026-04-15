import { CalcFailure, CalcSuccess } from '@/types/common';

export const OPERATORS = new Set(['+', '-', '*', '/']);

export const isOperator = (value: string): boolean => OPERATORS.has(value);

export const keyRows = [
  ['C', '⌫', '/', '*'],
  ['7', '8', '9', '-'],
  ['4', '5', '6', '+'],
  ['1', '2', '3', '='],
  ['0', '.'],
];

const precedence = (op: string): number => {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/') return 2;
  return 0;
};

const normalizeLeadingDecimals = (expr: string): string => {
  let normalized = expr.replace(/^\./, '0.');
  normalized = normalized.replace(/([+\-*/])\./g, '$10.');
  return normalized;
};

const tokenize = (expression: string): string[] => {
  const tokens: string[] = [];
  let current = '';

  for (let i = 0; i < expression.length; i += 1) {
    const char = expression[i];
    if (/\d|\./.test(char)) {
      current += char;
      continue;
    }

    if (OPERATORS.has(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      tokens.push(char);
    }
  }

  if (current) tokens.push(current);

  return tokens;
};

const isOperatorToken = (token: string): boolean => OPERATORS.has(token);

const hasValidNumberTokens = (tokens: string[]): boolean => {
  return tokens
    .filter((token) => !isOperatorToken(token))
    .every((token) => {
      if ((token.match(/\./g) || []).length > 1) return false;
      if (token === '.') return false;
      return /^\d+(\.\d+)?$/.test(token);
    });
};

export const isValidExpression = (rawExpr: string): boolean => {
  const expr = normalizeLeadingDecimals(rawExpr.replace(/\s+/g, ''));
  if (!expr) return false;
  if (/[^\d+\-*/.]/.test(expr)) return false;
  if (/[*+/]{2,}|--|\+\+|\+-|-\+|\.\./.test(expr)) return false;
  if (/^[*/+]/.test(expr)) return false;
  if (/[+\-*/.]$/.test(expr)) return false;

  const tokens = tokenize(expr);
  if (tokens.length === 0) return false;

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (isOperatorToken(token)) {
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      if (!prev || !next || isOperatorToken(prev) || isOperatorToken(next)) {
        return false;
      }
    }
  }

  return hasValidNumberTokens(tokens);
};

const toRpn = (tokens: string[]): string[] => {
  const output: string[] = [];
  const stack: string[] = [];

  tokens.forEach((token) => {
    if (!isOperatorToken(token)) {
      output.push(token);
      return;
    }

    while (stack.length > 0 && precedence(stack[stack.length - 1]) >= precedence(token)) {
      output.push(stack.pop() as string);
    }

    stack.push(token);
  });

  while (stack.length > 0) {
    output.push(stack.pop() as string);
  }

  return output;
};

const evaluateRpn = (rpn: string[]): CalcSuccess | CalcFailure => {
  const stack: number[] = [];

  for (let i = 0; i < rpn.length; i += 1) {
    const token = rpn[i];
    if (!isOperatorToken(token)) {
      const value = Number(token);
      if (!Number.isFinite(value)) {
        return { ok: false, error: 'Invalid expression' };
      }
      stack.push(value);
      continue;
    }

    if (stack.length < 2) {
      return { ok: false, error: 'Invalid expression' };
    }

    const right = stack.pop() as number;
    const left = stack.pop() as number;

    if (token === '/' && right === 0) {
      return { ok: false, error: 'Cannot divide by zero' };
    }

    let result = 0;
    if (token === '+') result = left + right;
    if (token === '-') result = left - right;
    if (token === '*') result = left * right;
    if (token === '/') result = left / right;

    stack.push(result);
  }

  if (stack.length !== 1 || !Number.isFinite(stack[0])) {
    return { ok: false, error: 'Invalid expression' };
  }

  return { ok: true, value: stack[0] };
};

export const safeEvaluate = (rawExpr: string): CalcSuccess | CalcFailure => {
  const expr = normalizeLeadingDecimals(rawExpr.replace(/\s+/g, ''));
  if (!isValidExpression(expr)) {
    return { ok: false, error: 'Invalid expression' };
  }

  const tokens = tokenize(expr);
  const rpn = toRpn(tokens);
  return evaluateRpn(rpn);
};

export const formatResult = (value: number): string => {
  if (!Number.isFinite(value)) return '0';

  const fixed = value.toFixed(6);
  const trimmed = fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  return trimmed === '-0' ? '0' : trimmed;
};

export const normalizeExpressionInput = (rawExpr: string): string => {
  return normalizeLeadingDecimals(rawExpr.replace(/\s+/g, ''));
};
