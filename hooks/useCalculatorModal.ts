import {
  formatResult,
  isOperator,
  isValidExpression,
  normalizeExpressionInput,
  safeEvaluate,
} from '@/lib/calc';
import { useEffect, useMemo, useState } from 'react';

export const useCalculatorModal = ({ visible, initialValue, onClose, onConfirm }: any) => {
  const [expression, setExpression] = useState('');
  const [lastResult, setLastResult] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    const initialExpr = normalizeExpressionInput(initialValue || '');
    setExpression(initialExpr);
    setError('');
  }, [initialValue, visible]);

  const evaluation = useMemo(() => {
    if (!expression || !isValidExpression(expression)) return null;
    const result = safeEvaluate(expression);
    return result.ok ? result : null;
  }, [expression]);

  const canConfirm = !!evaluation && !error;

  const appendValue = (value: string) => {
    if (error) setError('');

    if (value === '.') {
      const expr = expression || '';
      const lastOperatorIndex = Math.max(
        expr.lastIndexOf('+'),
        expr.lastIndexOf('-'),
        expr.lastIndexOf('*'),
        expr.lastIndexOf('/'),
      );
      const currentToken = expr.slice(lastOperatorIndex + 1);
      if (currentToken.includes('.')) return;
      if (!expr || isOperator(expr[expr.length - 1])) {
        setExpression(`${expr}0.`);
        return;
      }
    }

    if (isOperator(value)) {
      if (!expression) return;
      const lastChar = expression[expression.length - 1];
      if (isOperator(lastChar) || lastChar === '.') return;
      setExpression(`${expression}${value}`);
      return;
    }

    setExpression((prev) => `${prev}${value}`);
  };

  const handleClear = () => {
    setExpression('');
    setError('');
  };

  const handleBackspace = () => {
    if (!expression) return;
    setExpression((prev) => prev.slice(0, -1));
    if (error) setError('');
  };

  const handleEquals = () => {
    if (!expression) return;
    const result = safeEvaluate(expression);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const formatted = formatResult(result.value);
    setLastResult(formatted);
    setExpression(formatted);
    setError('');
  };

  const handleOk = () => {
    if (!canConfirm || !evaluation) return;
    onConfirm(evaluation.value);
    onClose();
  };

  return {
    lastResult,
    appendValue,
    handleClear,
    handleBackspace,
    handleEquals,
    handleOk,
    expression,
    error,
    canConfirm,
  };
};
