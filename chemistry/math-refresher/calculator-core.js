export function createCalculatorCoreState(overrides = {}) {
    return {
        display: '0',
        error: '',
        accumulator: null,
        pendingOperator: '',
        awaitingNextInput: false,
        lastOperatorValue: null,
        exponentSignPending: false,
        ...overrides
    };
}

export function normalizeCalculatorCoreState(rawState, options = {}) {
    const source = (rawState && typeof rawState === 'object') ? rawState : {};
    const displayKey = options.displayKey || 'display';
    const aliasDisplay = source[displayKey];

    const normalized = createCalculatorCoreState({
        display: typeof source.display === 'string'
            ? source.display
            : (typeof aliasDisplay === 'string' ? aliasDisplay : '0'),
        error: typeof source.error === 'string' ? source.error : '',
        accumulator: Number.isFinite(source.accumulator) ? source.accumulator : null,
        pendingOperator: ['+', '-', '*', '/'].includes(source.pendingOperator) ? source.pendingOperator : '',
        awaitingNextInput: Boolean(source.awaitingNextInput),
        lastOperatorValue: Number.isFinite(source.lastOperatorValue) ? source.lastOperatorValue : null,
        exponentSignPending: Boolean(source.exponentSignPending)
    });

    if (!normalized.display) {
        normalized.display = '0';
    }

    return normalized;
}

function parseCalculatorNumber(displayValue) {
    const raw = (displayValue || '').trim();
    if (!raw) return Number.NaN;
    if (raw.endsWith('E') || raw.endsWith('E-') || raw.endsWith('E+')) return Number.NaN;
    return Number(raw.replace('E', 'e'));
}

function formatCalculatorNumber(value) {
    if (!Number.isFinite(value)) return 'Error';
    if (value === 0) return '0';
    const abs = Math.abs(value);
    if (abs >= 1e10 || abs < 1e-6) {
        return value.toExponential(6)
            .replace('e+', 'E')
            .replace('e', 'E')
            .replace(/(\.\d*?[1-9])0+E/, '$1E')
            .replace(/\.0+E/, 'E');
    }
    return String(Number(value.toPrecision(12)));
}

function computeCalculatorBinary(lhs, op, rhs) {
    if (op === '+') return lhs + rhs;
    if (op === '-') return lhs - rhs;
    if (op === '*') return lhs * rhs;
    if (op === '/') {
        if (rhs === 0) return null;
        return lhs / rhs;
    }
    return rhs;
}

export function reduceCalculatorState(currentState, key) {
    const next = normalizeCalculatorCoreState(currentState);
    next.error = '';

    const beginFreshEntryIfNeeded = () => {
        if (next.awaitingNextInput) {
            next.display = '0';
            next.awaitingNextInput = false;
            next.exponentSignPending = false;
        }
    };

    if (key === 'C') {
        return createCalculatorCoreState();
    }

    if (key === 'DEL') {
        if (next.awaitingNextInput) {
            next.awaitingNextInput = false;
            next.display = '0';
            return next;
        }
        const trimmed = (next.display || '0').slice(0, -1);
        next.display = (!trimmed || trimmed === '-') ? '0' : trimmed;
        return next;
    }

    if (key === '+/-') {
        beginFreshEntryIfNeeded();
        const current = next.display || '0';
        if (current.startsWith('-')) next.display = current.slice(1);
        else if (current !== '0') next.display = `-${current}`;
        return next;
    }

    if (/^[0-9]$/.test(key)) {
        beginFreshEntryIfNeeded();
        if (next.display === '0') next.display = key;
        else if (next.display === '-0') next.display = `-${key}`;
        else next.display = `${next.display}${key}`;
        next.exponentSignPending = false;
        return next;
    }

    if (key === '.') {
        beginFreshEntryIfNeeded();
        if (next.display.includes('E')) {
            next.error = 'Decimal point cannot be added after exponent.';
            return next;
        }
        if (next.display.includes('.')) {
            next.error = 'Mantissa already has a decimal point.';
            return next;
        }
        next.display = `${next.display}.`;
        return next;
    }

    if (key === 'EE') {
        beginFreshEntryIfNeeded();
        if (next.display.includes('E')) {
            next.error = 'Exponent marker already entered.';
            return next;
        }
        if ((next.display || '').endsWith('.')) {
            next.error = 'Complete mantissa digits before EE.';
            return next;
        }
        next.display = `${next.display}E`;
        next.exponentSignPending = true;
        return next;
    }

    if ((key === '+' || key === '-') && next.exponentSignPending) {
        if ((next.display || '').endsWith('E')) {
            next.display = `${next.display}${key}`;
            next.exponentSignPending = false;
            return next;
        }
        next.exponentSignPending = false;
    }

    if (['+', '-', '*', '/'].includes(key)) {
        const current = parseCalculatorNumber(next.display);
        if (!Number.isFinite(current)) {
            next.error = 'Current display is not a valid number for operation.';
            return next;
        }

        if (next.accumulator === null) {
            next.accumulator = current;
        } else if (next.pendingOperator && !next.awaitingNextInput) {
            const result = computeCalculatorBinary(next.accumulator, next.pendingOperator, current);
            if (result === null) {
                return createCalculatorCoreState({
                    display: 'Error',
                    error: 'Division by zero is undefined.'
                });
            }
            next.accumulator = result;
            next.display = formatCalculatorNumber(result);
        }

        next.pendingOperator = key;
        next.awaitingNextInput = true;
        next.lastOperatorValue = null;
        next.exponentSignPending = false;
        return next;
    }

    if (key === '=' || key === 'ENTER') {
        if (!next.pendingOperator) {
            next.error = 'No pending operation. Enter an operator first.';
            return next;
        }

        const current = parseCalculatorNumber(next.display);
        if (!Number.isFinite(current)) {
            next.error = 'Cannot evaluate with invalid display value.';
            return next;
        }

        if (next.accumulator === null) next.accumulator = current;

        const rhs = next.awaitingNextInput ? (next.lastOperatorValue ?? current) : current;
        const result = computeCalculatorBinary(next.accumulator, next.pendingOperator, rhs);
        if (result === null) {
            return createCalculatorCoreState({
                display: 'Error',
                error: 'Division by zero is undefined.'
            });
        }

        next.accumulator = result;
        next.display = formatCalculatorNumber(result);
        next.awaitingNextInput = true;
        next.lastOperatorValue = rhs;
        next.pendingOperator = '';
        next.exponentSignPending = false;
        return next;
    }

    return next;
}

export function mapKeyboardEventToCalculatorKey(event) {
    if (event.key >= '0' && event.key <= '9') return event.key;
    if (event.key === '.') return '.';
    if (event.key === 'e' || event.key === 'E') return 'EE';
    if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') return event.key;
    if (event.key === 'x' || event.key === 'X') return '*';
    if (event.key === '=' || event.key === 'Enter' || event.key === 'NumpadEnter') return '=';
    if (event.key === 'Backspace') return 'DEL';
    if (event.key === 'Escape') return 'C';
    return null;
}
