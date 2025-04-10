// DOM Elements
const aInput = document.getElementById('a');
const bInput = document.getElementById('b');
const cInput = document.getElementById('c');
const solveBtn = document.getElementById('solveBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsDiv = document.getElementById('results');
const rootsDiv = document.getElementById('roots');
const discriminantDiv = document.getElementById('discriminant');
const natureDiv = document.getElementById('nature');
const vertexDiv = document.getElementById('vertex');
const stepsDiv = document.getElementById('steps');
const pdfBtn = document.getElementById('pdfBtn');
const shareBtn = document.getElementById('shareBtn');
const voiceBtn = document.getElementById('voiceBtn');
const voiceStatus = document.getElementById('voiceStatus');
const themeBtn = document.getElementById('themeBtn');
const quadraticChartCtx = document.getElementById('quadraticChart').getContext('2d');

// Calculator Elements
const calcInput = document.getElementById('calcInput');
const calcHistory = document.getElementById('calcHistory');
const calcButtons = document.querySelectorAll('.calc-btn');
const secondFnButtons = document.querySelectorAll('.second-fn');

// Global Variables
let quadraticChart = null;
let memory = 0;
let isSecondFnActive = false;
let recognition;

// Initialize the app
function init() {
    // Event Listeners for Quadratic Solver
    solveBtn.addEventListener('click', solveQuadratic);
    clearBtn.addEventListener('click', clearInputs);
    pdfBtn.addEventListener('click', generatePDF);
    shareBtn.addEventListener('click', shareResults);
    voiceBtn.addEventListener('click', toggleVoiceInput);
    themeBtn.addEventListener('click', toggleTheme);
    
    // Event Listeners for Calculator
    calcButtons.forEach(button => {
        button.addEventListener('click', () => handleCalculatorButton(button.dataset.value));
    });
    
    // Initialize Chart
    initChart();
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Initialize voice recognition if available
    initVoiceRecognition();
}

// Quadratic Equation Solver Functions
function solveQuadratic() {
    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);
    const c = parseFloat(cInput.value);
    
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        alert('Please enter valid numbers for all coefficients');
        return;
    }
    
    if (a === 0) {
        alert('Coefficient "a" cannot be zero in a quadratic equation');
        return;
    }
    
    // Calculate discriminant
    const discriminant = b * b - 4 * a * c;
    
    // Calculate roots
    let root1, root2;
    if (discriminant > 0) {
        root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    } else if (discriminant === 0) {
        root1 = root2 = -b / (2 * a);
    } else {
        const realPart = -b / (2 * a);
        const imaginaryPart = Math.sqrt(Math.abs(discriminant)) / (2 * a);
        root1 = `${realPart.toFixed(4)} + ${imaginaryPart.toFixed(4)}i`;
        root2 = `${realPart.toFixed(4)} - ${imaginaryPart.toFixed(4)}i`;
    }
    
    // Determine nature of roots
    let nature;
    if (discriminant > 0) {
        nature = 'Two distinct real roots';
    } else if (discriminant === 0) {
        nature = 'One real root (double root)';
    } else {
        nature = 'Two complex conjugate roots';
    }
    
    // Calculate vertex and axis of symmetry
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    const axisOfSymmetry = `x = ${vertexX.toFixed(4)}`;
    
    // Generate step-by-step solution
    const steps = generateSolutionSteps(a, b, c, discriminant);
    
    // Display results
    rootsDiv.innerHTML = `<strong>Roots:</strong> x₁ = ${root1}, x₂ = ${root2}`;
    discriminantDiv.innerHTML = `<strong>Discriminant (Δ):</strong> ${discriminant.toFixed(4)}`;
    natureDiv.innerHTML = `<strong>Nature of Roots:</strong> ${nature}`;
    vertexDiv.innerHTML = `<strong>Vertex:</strong> (${vertexX.toFixed(4)}, ${vertexY.toFixed(4)})<br>
                          <strong>Axis of Symmetry:</strong> ${axisOfSymmetry}`;
    stepsDiv.innerHTML = `<strong>Step-by-Step Solution:</strong><br>${steps}`;
    
    // Show results and update chart
    resultsDiv.style.display = 'block';
    updateChart(a, b, c);
}

function generateSolutionSteps(a, b, c, discriminant) {
    let steps = [];
    
    steps.push(`1. Given equation: ${a}x² + ${b}x + ${c} = 0`);
    steps.push(`2. Identify coefficients: a = ${a}, b = ${b}, c = ${c}`);
    steps.push(`3. Calculate discriminant (Δ = b² - 4ac):`);
    steps.push(`   Δ = (${b})² - 4 × ${a} × ${c} = ${b*b} - ${4*a*c} = ${discriminant}`);
    
    if (discriminant > 0) {
        steps.push(`4. Since Δ > 0, there are two distinct real roots.`);
        steps.push(`5. Calculate roots using quadratic formula:`);
        steps.push(`   x = [-b ± √Δ] / (2a)`);
        steps.push(`   x₁ = [${-b} + √${discriminant}] / ${2*a} = ${(-b + Math.sqrt(discriminant)) / (2 * a)}`);
        steps.push(`   x₂ = [${-b} - √${discriminant}] / ${2*a} = ${(-b - Math.sqrt(discriminant)) / (2 * a)}`);
    } else if (discriminant === 0) {
        steps.push(`4. Since Δ = 0, there is exactly one real root.`);
        steps.push(`5. Calculate root using quadratic formula:`);
        steps.push(`   x = -b / (2a) = ${-b} / ${2*a} = ${-b / (2 * a)}`);
    } else {
        steps.push(`4. Since Δ < 0, there are two complex conjugate roots.`);
        steps.push(`5. Calculate roots using quadratic formula:`);
        steps.push(`   x = [-b ± i√|Δ|] / (2a)`);
        const realPart = -b / (2 * a);
        const imaginaryPart = Math.sqrt(Math.abs(discriminant)) / (2 * a);
        steps.push(`   x₁ = ${realPart} + ${imaginaryPart}i`);
        steps.push(`   x₂ = ${realPart} - ${imaginaryPart}i`);
    }
    
    steps.push(`6. Vertex form: The vertex is at (h, k) where h = -b/(2a) = ${-b / (2 * a)}`);
    steps.push(`   k = f(h) = ${a * (-b / (2 * a)) ** 2 + b * (-b / (2 * a)) + c}`);
    
    return steps.join('<br>');
}

function clearInputs() {
    aInput.value = '';
    bInput.value = '';
    cInput.value = '';
    resultsDiv.style.display = 'none';
    if (quadraticChart) {
        quadraticChart.data.datasets[0].data = [];
        quadraticChart.update();
    }
}

function initChart() {
    quadraticChart = new Chart(quadraticChartCtx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Quadratic Function',
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    title: {
                        display: true,
                        text: 'x-axis'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    title: {
                        display: true,
                        text: 'y-axis'
                    }
                }
            },
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy',
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    }
                },
                tooltip: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        }
    });
}

function updateChart(a, b, c) {
    const data = [];
    const step = 0.1;
    const range = 10;
    
    for (let x = -range; x <= range; x += step) {
        const y = a * x * x + b * x + c;
        data.push({x, y});
    }
    
    // Find vertex for annotation
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    
    quadraticChart.data.datasets[0].data = data;
    quadraticChart.options.plugins.annotation = {
        annotations: {
            point1: {
                type: 'point',
                xValue: vertexX,
                yValue: vertexY,
                radius: 5,
                backgroundColor: 'rgba(255, 99, 132, 1)',
                label: {
                    content: `Vertex (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`,
                    enabled: true,
                    position: 'top'
                }
            }
        }
    };
    
    quadraticChart.update();
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(0, 122, 255);
    doc.text('Quadratic Equation Solution', 105, 20, null, null, 'center');
    
    // Add equation
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);
    const c = parseFloat(cInput.value);
    doc.text(`Equation: ${a}x² + ${b}x + ${c} = 0`, 14, 30);
    
    // Add solution details
    doc.setFontSize(12);
    doc.text(rootsDiv.textContent, 14, 40);
    doc.text(discriminantDiv.textContent, 14, 46);
    doc.text(natureDiv.textContent, 14, 52);
    doc.text(vertexDiv.textContent.split('<br>')[0], 14, 58);
    doc.text(vertexDiv.textContent.split('<br>')[1], 14, 64);
    
    // Add steps
    doc.setFontSize(12);
    const steps = stepsDiv.innerHTML.split('<br>');
    let yPos = 74;
    steps.forEach(step => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(step.replace(/<strong>|<\/strong>/g, ''), 14, yPos);
        yPos += 6;
    });
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by Quadratic Solver by Anant Kumar - Powered by QuantumAnant', 105, 285, null, null, 'center');
    
    // Save the PDF
    doc.save('quadratic_solution.pdf');
}

function shareResults() {
    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);
    const c = parseFloat(cInput.value);
    const roots = rootsDiv.textContent.replace('<strong>Roots:</strong> ', '');
    const discriminant = discriminantDiv.textContent.replace('<strong>Discriminant (Δ):</strong> ', '');
    const nature = natureDiv.textContent.replace('<strong>Nature of Roots:</strong> ', '');
    const vertex = vertexDiv.textContent.replace(/<strong>.*?<\/strong>/g, '').replace(/<br>/g, ', ');
    
    const message = `Quadratic Equation Solution:
    
Equation: ${a}x² + ${b}x + ${c} = 0
${roots}
Discriminant: ${discriminant}
${nature}
Vertex: ${vertex}

Shared via Quadratic Solver by Anant Kumar`;

    if (navigator.share) {
        navigator.share({
            title: 'Quadratic Equation Solution',
            text: message,
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare(message);
        });
    } else {
        fallbackShare(message);
    }
}

function fallbackShare(message) {
    // Try WhatsApp sharing
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            voiceStatus.textContent = 'Listening... Speak now';
            voiceBtn.style.backgroundColor = '#FF3B30';
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            processVoiceInput(transcript);
        };
        
        recognition.onerror = function(event) {
            voiceStatus.textContent = 'Error occurred in recognition: ' + event.error;
            voiceBtn.style.backgroundColor = '';
        };
        
        recognition.onend = function() {
            voiceBtn.style.backgroundColor = '';
            voiceStatus.textContent = '';
        };
    } else {
        voiceBtn.disabled = true;
        voiceBtn.title = 'Voice recognition not supported in this browser';
    }
}

function toggleVoiceInput() {
    if (recognition) {
        recognition.start();
    }
}

function processVoiceInput(transcript) {
    // Example: "a is 2, b is 5, c is negative 3"
    const aMatch = transcript.match(/a (?:is|equals) (?:negative )?(\d+)/i);
    const bMatch = transcript.match(/b (?:is|equals) (?:negative )?(\d+)/i);
    const cMatch = transcript.match(/c (?:is|equals) (?:negative )?(\d+)/i);
    
    if (aMatch) {
        const isNegative = transcript.includes('negative') && transcript.indexOf('negative') < transcript.indexOf(aMatch[1]);
        aInput.value = isNegative ? -parseInt(aMatch[1]) : parseInt(aMatch[1]);
    }
    
    if (bMatch) {
        const isNegative = transcript.includes('negative') && transcript.indexOf('negative') < transcript.indexOf(bMatch[1]);
        bInput.value = isNegative ? -parseInt(bMatch[1]) : parseInt(bMatch[1]);
    }
    
    if (cMatch) {
        const isNegative = transcript.includes('negative') && transcript.indexOf('negative') < transcript.indexOf(cMatch[1]);
        cInput.value = isNegative ? -parseInt(cMatch[1]) : parseInt(cMatch[1]);
    }
    
    voiceStatus.textContent = 'Voice input processed';
    setTimeout(() => { voiceStatus.textContent = ''; }, 2000);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Calculator Functions
function handleCalculatorButton(value) {
    const currentInput = calcInput.textContent;
    const history = calcHistory.textContent;
    
    // Handle number input
    if (!isNaN(value) || value === '.') {
        if (currentInput === '0' && value !== '.') {
            calcInput.textContent = value;
        } else {
            calcInput.textContent += value;
        }
        return;
    }
    
    // Handle clear
    if (value === 'C') {
        calcInput.textContent = '0';
        calcHistory.textContent = '';
        return;
    }
    
    // Handle memory functions
    if (value === 'm+') {
        memory += parseFloat(currentInput);
        calcHistory.textContent = `M+ ${currentInput} (M=${memory})`;
        return;
    }
    
    if (value === 'm-') {
        memory -= parseFloat(currentInput);
        calcHistory.textContent = `M- ${currentInput} (M=${memory})`;
        return;
    }
    
    if (value === 'mr') {
        calcInput.textContent = memory.toString();
        return;
    }
    
    if (value === 'mc') {
        memory = 0;
        calcHistory.textContent = 'Memory cleared';
        return;
    }
    
    // Handle 2nd function toggle
    if (value === '2nd') {
        isSecondFnActive = !isSecondFnActive;
        secondFnButtons.forEach(btn => {
            btn.classList.toggle('visible', isSecondFnActive);
        });
        return;
    }
    
    // Handle sign toggle
    if (value === '±') {
        if (currentInput.startsWith('-')) {
            calcInput.textContent = currentInput.substring(1);
        } else {
            calcInput.textContent = '-' + currentInput;
        }
        return;
    }
    
    // Handle constants
    if (value === 'π') {
        calcInput.textContent = Math.PI.toString();
        return;
    }
    
    if (value === 'e') {
        calcInput.textContent = Math.E.toString();
        return;
    }
    
    // Handle operators
    if (['+', '-', '*', '/', '^'].includes(value)) {
        calcHistory.textContent = `${currentInput} ${value}`;
        calcInput.textContent = '0';
        return;
    }
    
    // Handle equals
    if (value === '=') {
        try {
            let expression = `${history} ${currentInput}`;
            
            // Replace special functions
            expression = expression.replace(/sin/g, 'Math.sin');
            expression = expression.replace(/cos/g, 'Math.cos');
            expression = expression.replace(/tan/g, 'Math.tan');
            expression = expression.replace(/asin/g, 'Math.asin');
            expression = expression.replace(/acos/g, 'Math.acos');
            expression = expression.replace(/atan/g, 'Math.atan');
            expression = expression.replace(/log/g, 'Math.log10');
            expression = expression.replace(/ln/g, 'Math.log');
            expression = expression.replace(/log2/g, 'Math.log2');
            expression = expression.replace(/\^/g, '**');
            expression = expression.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
            expression = expression.replace(/√(\d+)/g, 'Math.sqrt($1)');
            expression = expression.replace(/\|x\|/g, 'Math.abs');
            expression = expression.replace(/!/g, 'factorial');
            
            // Evaluate the expression
            function factorial(n) {
                if (n < 0) return NaN;
                if (n === 0 || n === 1) return 1;
                let result = 1;
                for (let i = 2; i <= n; i++) {
                    result *= i;
                }
                return result;
            }
            
            const result = eval(expression);
            calcHistory.textContent = `${expression} =`;
            calcInput.textContent = result.toString();
        } catch (error) {
            calcInput.textContent = 'Error';
            console.error(error);
        }
        return;
    }
    
    // Handle other functions
    if (['sin', 'cos', 'tan', 'log', 'ln', '√', '|x|', '!'].includes(value)) {
        calcHistory.textContent = `${value}(${currentInput})`;
        calcInput.textContent = '0';
        return;
    }
    
    // Handle second functions
    if (['asin', 'acos', 'atan', 'log2', 'logy'].includes(value)) {
        calcHistory.textContent = `${value}(${currentInput})`;
        calcInput.textContent = '0';
        return;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);