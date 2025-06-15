// Get DOM elements
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const historyList = document.getElementById('historyList');

let currentInput = '';
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];

updateHistoryUI();

// Handle button clicks
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.getAttribute('data-value');

    switch (value) {
      case '=':
        try {
          const result = eval(currentInput);
          display.textContent = result;
          addToHistory(currentInput, result);
          currentInput = result.toString();
        } catch (err) {
          display.textContent = 'Error';
          currentInput = '';
        }
        break;
      case 'AC':
        currentInput = '';
        display.textContent = '0';
        break;
      case 'DEL':
        currentInput = currentInput.slice(0, -1);
        display.textContent = currentInput || '0';
        break;
      case '+/-':
        if (currentInput) {
          currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;
          display.textContent = currentInput;
        }
        break;
      default:
        currentInput += value;
        display.textContent = currentInput;
    }
  });
});

function addToHistory(expression, result) {
  const history = JSON.parse(localStorage.getItem("calcHistory")) || [];
  history.unshift({ expression, result });
  localStorage.setItem("calcHistory", JSON.stringify(history));
  updateHistoryUI();
}

function updateHistoryUI() {
  const history = JSON.parse(localStorage.getItem("calcHistory")) || [];
  const historyList = document.getElementById("historyList");

  if (history.length === 0) {
    historyList.innerHTML = `<p>No calculations yet</p>`;
    return;
  }

  historyList.innerHTML = "";
  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <small>${item.expression.replace(/\*/g, '×').replace(/\//g, '÷')}</small><br />
      <strong>${item.result}</strong>
    `;
    historyList.appendChild(div);
  });
}

// Toggle Theme
function toggleTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Load theme on page load
window.onload = () => {
  const theme = localStorage.getItem('theme');
  if (theme === 'light') {
    document.body.classList.add('light');
  }
  updateHistoryUI();
};
function clearHistory() {
  localStorage.removeItem('calcHistory');
  history = [];
  updateHistoryUI();
}
document.addEventListener('keydown', (e) => {
  const key = e.key;

  if (!isNaN(key) || ['+', '-', '*', '/', '.', '%'].includes(key)) {
    currentInput += key;
    display.textContent = currentInput;
  } else if (key === 'Enter') {
    try {
      const result = eval(currentInput);
      display.textContent = result;
      addToHistory(currentInput, result);
      currentInput = result.toString();
    } catch {
      display.textContent = 'Error';
      currentInput = '';
    }
  } else if (key === 'Backspace') {
    currentInput = currentInput.slice(0, -1);
    display.textContent = currentInput || '0';
  } else if (key === 'Escape') {
    currentInput = '';
    display.textContent = '0';
  }
});

