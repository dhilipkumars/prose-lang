# Simple Calculator

## Overview
This is a simple calculator application generated from a Prose specification. It supports basic arithmetic operations: addition, subtraction, multiplication, and division.

## Features
- **Digit Input**: Enter numbers using the keypad.
- **Arithmetic Operations**: Perform +, -, *, and /.
- **Clear**: Reset the calculator state using the "AC" button.
- **Decimal Point**: Support for floating-point numbers.
- **Equals**: Calculate the final result.

## Data Dictionary (Memory)
- `DisplayValue`: The current string shown on the calculator display.
- `PreviousValue`: The previous number stored for an operation.
- `Operator`: The current arithmetic operator (+, -, *, /).
- `WaitingForOperand`: Boolean flag to indicate if the next digit starts a new number.

## Usage Guide
1. To start the application, navigate to the `generated/calc` directory and run:
   ```bash
   npm install
   npm start
   ```
2. Use the keypad to input numbers.
3. Click an operator button (+, -, *, /) to perform an operation.
4. Click the "=" button to see the final result.
5. Use "AC" to clear the display and reset the calculator.
