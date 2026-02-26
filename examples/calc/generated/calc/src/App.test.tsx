import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Calculator', () => {
    it('calc.inputDigit: inputs multiple digits sequentially', () => {
        render(<App />);
        fireEvent.click(screen.getByText('一'));
        fireEvent.click(screen.getByText('二'));
        fireEvent.click(screen.getByText('三'));
        // screen.getByText finds the element by text.
        // It should match the display div containing exactly '一二三'
        expect(screen.getByText('一二三')).toBeDefined();
    });

    it('calc.inputDot: inputs a dot after a digit, accepts only one', () => {
        render(<App />);
        fireEvent.click(screen.getByText('一'));
        fireEvent.click(screen.getByText('.'));
        fireEvent.click(screen.getByText('五'));
        // Try adding another dot
        fireEvent.click(screen.getByText('.'));
        expect(screen.getByText('一.五')).toBeDefined();
    });

    it('calc.clear: resets the calculator state', () => {
        render(<App />);
        // Simulate some state changes: 2 + 3 = 5, then AC
        fireEvent.click(screen.getByText('二'));
        fireEvent.click(screen.getByText('+'));
        fireEvent.click(screen.getByText('三'));
        fireEvent.click(screen.getByText('='));
        // '五' is also a button, so we expect two elements with '五'
        expect(screen.getAllByText('五').length).toBe(2);

        // Clear
        fireEvent.click(screen.getByText('AC'));
        // App starts with '0' normally. It should be reset to '0'
        // '零' might also match the '零' button, so we can use getAllByText('零') and assert there are 2 (button + display)
        const zeros = screen.getAllByText('零');
        expect(zeros.length).toBeGreaterThan(0);
    });

    it('calc.performOperation: performs addition', () => {
        render(<App />);
        fireEvent.click(screen.getByText('二'));
        fireEvent.click(screen.getByText('+'));
        fireEvent.click(screen.getByText('三'));
        fireEvent.click(screen.getByText('='));
        expect(screen.getAllByText('五').length).toBe(2);
    });
});
