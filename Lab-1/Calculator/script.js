
        const display = document.getElementById('display');
        let firstOperand = null;
        let operator = null;
        let waitingForSecondOperand = false;
        let currentValue = '0';

        function updateDisplay() {
            display.textContent = currentValue;
        }

        function inputNumber(num) {
            if (waitingForSecondOperand) {
                currentValue = num;
                waitingForSecondOperand = false;
            } else {
                currentValue = currentValue === '0' ? num : currentValue + num;
            }
        }

        function inputDecimal() {
            if (!currentValue.includes('.')) {
                currentValue += '.';
            }
        }

        function handleOperator(nextOperator) {
            const inputValue = parseFloat(currentValue);
            if (operator && waitingForSecondOperand) {
                operator = nextOperator;
                return;
            }
            if (firstOperand == null) {
                firstOperand = inputValue;
            } else if (operator) {
                const result = performCalculation[operator](firstOperand, inputValue);
                currentValue = String(result);
                firstOperand = result;
            }
            operator = nextOperator;
            waitingForSecondOperand = true;
        }

        const performCalculation = {
            '/': (first, second) => second === 0 ? 'Error' : first / second,
            '*': (first, second) => first * second,
            '+': (first, second) => first + second,
            '-': (first, second) => first - second
        };

        function handleEquals() {
            if (operator && firstOperand != null && !waitingForSecondOperand) {
                const inputValue = parseFloat(currentValue);
                currentValue = String(performCalculation[operator](firstOperand, inputValue));
                firstOperand = null;
                operator = null;
                waitingForSecondOperand = false;
            }
        }

        function handleClear() {
            currentValue = '0';
            firstOperand = null;
            operator = null;
            waitingForSecondOperand = false;
        }

        function handleSign() {
            currentValue = String(parseFloat(currentValue) * -1);
        }

        function handlePercent() {
            currentValue = String(parseFloat(currentValue) / 100);
        }

        document.querySelector('.calculator-buttons').addEventListener('click', function(e) {
            const target = e.target;
            if (!target.matches('button')) return;
            const action = target.dataset.action;
            switch(action) {
                case 'number':
                    inputNumber(target.dataset.value);
                    break;
                case 'decimal':
                    inputDecimal();
                    break;
                case 'operator':
                    handleOperator(target.dataset.value);
                    break;
                case 'equals':
                    handleEquals();
                    break;
                case 'clear':
                    handleClear();
                    break;
                case 'sign':
                    handleSign();
                    break;
                case 'percent':
                    handlePercent();
                    break;
            }
            updateDisplay();
        });

        updateDisplay();
