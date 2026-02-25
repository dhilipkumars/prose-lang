import React, { useState } from 'react';

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('०');
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  
  const toDevanagari = (numStr) => {
    return numStr.split('').map(char => {
      const digit = parseInt(char);
      return isNaN(digit) ? char : devanagariDigits[digit];
    }).join('');
  };

  const fromDevanagari = (devStr) => {
    return devStr.split('').map(char => {
      const index = devanagariDigits.indexOf(char);
      return index === -1 ? char : index.toString();
    }).join('');
  };

  // Skill: calc.inputDigit
  const inputDigit = (digit) => {
    const devDigit = devanagariDigits[digit];
    if (waitingForOperand) {
      setDisplayValue(devDigit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '०' ? devDigit : displayValue + devDigit);
    }
  };

  // Skill: calc.inputDot
  const inputDot = () => {
    if (waitingForOperand) {
      setDisplayValue('०.');
      setWaitingForOperand(false);
    } else if (displayValue.indexOf('.') === -1) {
      setDisplayValue(displayValue + '.');
    }
  };

  // Skill: calc.clear
  const clear = () => {
    setDisplayValue('०');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  // Skill: calc.performOperation
  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(fromDevanagari(displayValue));

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      let result;

      switch (operator) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '*':
          result = currentValue * inputValue;
          break;
        case '/':
          result = currentValue / inputValue;
          break;
        default:
          result = inputValue;
      }

      setDisplayValue(toDevanagari(String(result)));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  // Theme: Light Grey and Black
  const styles = {
    calculator: {
      width: '320px',
      border: '1px solid #d1d1d1',
      borderRadius: '8px',
      boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      overflow: 'hidden'
    },
    display: {
      backgroundColor: '#000000',
      color: '#ffffff',
      textAlign: 'right',
      padding: '30px 20px',
      fontSize: '2.5em',
      fontWeight: '300',
      minHeight: '60px',
      wordBreak: 'break-all'
    },
    keypad: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      backgroundColor: '#d1d1d1'
    },
    button: {
      padding: '25px 10px',
      fontSize: '1.4em',
      border: '0.5px solid #cccccc',
      cursor: 'pointer',
      backgroundColor: '#eeeeee',
      color: '#000000',
      transition: 'all 0.1s ease',
      outline: 'none'
    },
    operatorButton: {
      backgroundColor: '#333333',
      color: '#ffffff',
      fontWeight: 'bold'
    },
    equalsButton: {
      backgroundColor: '#000000',
      color: '#ffffff',
      fontWeight: 'bold'
    },
    clearButton: {
      backgroundColor: '#dddddd',
      gridColumn: 'span 3',
      color: '#000000',
      fontWeight: 'bold'
    },
    zeroButton: {
      gridColumn: 'span 2'
    }
  };

  return (
    <div style={styles.calculator}>
      <div style={styles.display}>{displayValue}</div>
      <div style={styles.keypad}>
        <button 
          style={{ ...styles.button, ...styles.clearButton }} 
          onClick={() => clear()}
          onMouseDown={(e) => e.target.style.backgroundColor = '#cccccc'}
          onMouseUp={(e) => e.target.style.backgroundColor = '#dddddd'}
        >AC</button>
        <button 
          style={{ ...styles.button, ...styles.operatorButton }} 
          onClick={() => performOperation('/')}
          onMouseDown={(e) => e.target.style.backgroundColor = '#111111'}
          onMouseUp={(e) => e.target.style.backgroundColor = '#333333'}
        >÷</button>

        <button style={styles.button} onClick={() => inputDigit(7)}>७</button>
        <button style={styles.button} onClick={() => inputDigit(8)}>८</button>
        <button style={styles.button} onClick={() => inputDigit(9)}>९</button>
        <button 
          style={{ ...styles.button, ...styles.operatorButton }} 
          onClick={() => performOperation('*')}
          onMouseDown={(e) => e.target.style.backgroundColor = '#111111'}
          onMouseUp={(e) => e.target.style.backgroundColor = '#333333'}
        >×</button>

        <button style={styles.button} onClick={() => inputDigit(4)}>४</button>
        <button style={styles.button} onClick={() => inputDigit(5)}>५</button>
        <button style={styles.button} onClick={() => inputDigit(6)}>६</button>
        <button 
          style={{ ...styles.button, ...styles.operatorButton }} 
          onClick={() => performOperation('-')}
          onMouseDown={(e) => e.target.style.backgroundColor = '#111111'}
          onMouseUp={(e) => e.target.style.backgroundColor = '#333333'}
        >-</button>

        <button style={styles.button} onClick={() => inputDigit(1)}>१</button>
        <button style={styles.button} onClick={() => inputDigit(2)}>२</button>
        <button style={styles.button} onClick={() => inputDigit(3)}>३</button>
        <button 
          style={{ ...styles.button, ...styles.operatorButton }} 
          onClick={() => performOperation('+')}
          onMouseDown={(e) => e.target.style.backgroundColor = '#111111'}
          onMouseUp={(e) => e.target.style.backgroundColor = '#333333'}
        >+</button>

        <button style={{ ...styles.button, ...styles.zeroButton }} onClick={() => inputDigit(0)}>०</button>
        <button style={styles.button} onClick={() => inputDot()}>.</button>
        <button 
          style={{ ...styles.button, ...styles.equalsButton }} 
          onClick={() => performOperation(null)}
          onMouseDown={(e) => e.target.style.backgroundColor = '#333333'}
          onMouseUp={(e) => e.target.style.backgroundColor = '#000000'}
        >=</button>
      </div>
    </div>
  );
};

export default Calculator;
