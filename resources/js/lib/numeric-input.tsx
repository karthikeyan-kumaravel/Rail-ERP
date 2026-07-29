import type {
    ChangeEvent,
    ClipboardEvent,
    InputHTMLAttributes,
    KeyboardEvent,
} from 'react';

type NumericInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    allowDecimal?: boolean;
    allowNegative?: boolean;
};

function sanitizeNumericText(
    value: string,
    allowDecimal: boolean,
    allowNegative: boolean,
): string {
    const isNegative = allowNegative && value.trimStart().startsWith('-');
    let sanitized = value.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, '');

    if (allowDecimal) {
        const firstDot = sanitized.indexOf('.');

        if (firstDot !== -1) {
            sanitized =
                sanitized.slice(0, firstDot + 1) +
                sanitized.slice(firstDot + 1).replace(/\./g, '');
        }
    }

    return isNegative ? `-${sanitized}` : sanitized;
}

/**
 * Drop-in replacement for `<input type="number">`. Renders a plain text
 * input (so `e`/`E`/`+` and scientific notation like `1e5` can never be
 * entered — browsers accept all of those in a real number input) while
 * keeping the same string-based `value`/`onChange` contract every caller
 * already uses, so downstream parsing/formatting/validation is untouched.
 */
export default function NumericInput({
    onChange,
    onKeyDown,
    onPaste,
    allowDecimal = false,
    allowNegative = false,
    inputMode,
    ...rest
}: NumericInputProps) {
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(event);

        if (
            event.defaultPrevented ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey ||
            event.key.length > 1
        ) {
            return;
        }

        const input = event.currentTarget;

        if (/[0-9]/.test(event.key)) {
            return;
        }

        if (event.key === '.' && allowDecimal && !input.value.includes('.')) {
            return;
        }

        if (
            event.key === '-' &&
            allowNegative &&
            input.selectionStart === 0 &&
            !input.value.includes('-')
        ) {
            return;
        }

        event.preventDefault();
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        onPaste?.(event);

        if (event.defaultPrevented) {
            return;
        }

        event.preventDefault();

        const input = event.currentTarget;
        const pasted = sanitizeNumericText(
            event.clipboardData.getData('text'),
            allowDecimal,
            allowNegative,
        );
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        const nextValue = sanitizeNumericText(
            input.value.slice(0, start) + pasted + input.value.slice(end),
            allowDecimal,
            allowNegative,
        );

        const nativeValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value',
        )?.set;
        nativeValueSetter?.call(input, nextValue);

        const cursor = Math.min(start + pasted.length, nextValue.length);
        input.setSelectionRange(cursor, cursor);

        input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const sanitized = sanitizeNumericText(
            event.target.value,
            allowDecimal,
            allowNegative,
        );

        if (sanitized !== event.target.value) {
            event.target.value = sanitized;
        }

        onChange(event);
    };

    return (
        <input
            {...rest}
            type="text"
            inputMode={inputMode ?? (allowDecimal ? 'decimal' : 'numeric')}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onChange={handleChange}
        />
    );
}
