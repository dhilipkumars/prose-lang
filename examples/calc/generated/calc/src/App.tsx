import { useState } from 'react'
import './App.css'

// Helper function to convert Western Arabic digits to Mandarin digits
const toMandarinScript = (str: string) => {
    const mandarinDigits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return str.replace(/[0-9]/g, w => mandarinDigits[w.charCodeAt(0) - 48]);
}
import './App.css'

function App() {
    // Memory (The Workspace)
    const [displayValue, setDisplayValue] = useState<string>('0')
    const [previousValue, setPreviousValue] = useState<number | null>(null)
    const [operator, setOperator] = useState<string | null>(null)
    const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false)

    // Skill: calc.inputDigit
    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplayValue(digit)
            setWaitingForOperand(false)
        } else {
            if (displayValue === '0') {
                setDisplayValue(digit)
            } else {
                setDisplayValue(displayValue + digit)
            }
        }
    }

    // Skill: calc.inputDot
    const inputDot = () => {
        if (waitingForOperand) {
            setDisplayValue('0.')
            setWaitingForOperand(false)
        } else if (!displayValue.includes('.')) {
            setDisplayValue(displayValue + '.')
        }
    }

    // Skill: calc.clear
    const clear = () => {
        setDisplayValue('0')
        setPreviousValue(null)
        setOperator(null)
        setWaitingForOperand(false)
    }

    // Skill: calc.performOperation
    const performOperation = (nextOperator: string | null) => {
        const inputValue = parseFloat(displayValue)

        if (previousValue === null) {
            setPreviousValue(inputValue)
        } else if (operator !== null) {
            const currentPrevious = previousValue || 0;
            let result = 0;
            if (operator === '+') result = currentPrevious + inputValue;
            else if (operator === '-') result = currentPrevious - inputValue;
            else if (operator === '*') result = currentPrevious * inputValue;
            else if (operator === '/') result = currentPrevious / inputValue;
            else result = inputValue;

            setDisplayValue(String(result))
            setPreviousValue(result)
        }

        setWaitingForOperand(true)
        setOperator(nextOperator)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent">
            <div className="bg-black p-6 rounded-3xl shadow-2xl w-80 border-4 border-gray-300">
                {/* Interface: Display */}
                <div className="bg-gray-200 text-black text-right text-5xl p-4 rounded-2xl mb-6 h-24 flex items-center justify-end overflow-hidden break-all font-mono font-semibold shadow-inner">
                    {toMandarinScript(displayValue)}
                </div>

                {/* Interface: Keypad */}
                <div className="grid grid-cols-4 gap-3">
                    {/* Top row */}
                    <button onClick={clear} className="col-span-2 bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-4 rounded-xl shadow transition duration-200">AC</button>
                    <button onClick={() => performOperation('/')} className={`bg-gray-400 hover:bg-gray-500 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200 ${operator === '/' ? 'ring-4 ring-gray-100' : ''}`}>/</button>
                    <button onClick={() => performOperation('*')} className={`bg-gray-400 hover:bg-gray-500 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200 ${operator === '*' ? 'ring-4 ring-gray-100' : ''}`}>*</button>

                    {/* Number pad */}
                    <button onClick={() => inputDigit('7')} className="bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">七</button>
                    <button onClick={() => inputDigit('8')} className="bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">八</button>
                    <button onClick={() => inputDigit('9')} className="bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">九</button>
                    <button onClick={() => performOperation('-')} className={`bg-gray-400 hover:bg-gray-500 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200 ${operator === '-' ? 'ring-4 ring-gray-100' : ''}`}>-</button>

                    <button onClick={() => inputDigit('4')} className="bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">四</button>
                    <button onClick={() => inputDigit('5')} className="bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">五</button>
                    <button onClick={() => inputDigit('6')} className="bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">六</button>
                    <button onClick={() => performOperation('+')} className={`bg-gray-400 hover:bg-gray-500 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200 ${operator === '+' ? 'ring-4 ring-gray-100' : ''}`}>+</button>

                    <button onClick={() => inputDigit('1')} className="bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">一</button>
                    <button onClick={() => inputDigit('2')} className="bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">二</button>
                    <button onClick={() => inputDigit('3')} className="bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">三</button>

                    {/* Equals button spanning 2 rows */}
                    <button onClick={() => performOperation(null)} className="row-span-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-3xl font-bold py-4 rounded-xl shadow transition duration-200">=</button>

                    <button onClick={() => inputDigit('0')} className="col-span-2 bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">零</button>
                    <button onClick={() => inputDot()} className="bg-gray-300 hover:bg-gray-400 text-black text-xl font-bold py-4 rounded-xl shadow transition duration-200">.</button>
                </div>
            </div>
        </div>
    )
}

export default App
