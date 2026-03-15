const generateCode = () => {
    const availableDigits = [];
    
    // Create an array with each digit (0-9) repeated 2 times
    for (let i = 0; i <= 9; i++) {
        availableDigits.push(i, i);
    }
    
    // Shuffle the array
    for (let i = availableDigits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        
        // Swap elements without array destructuring
        const temp = availableDigits[i];
        availableDigits[i] = availableDigits[j];
        availableDigits[j] = temp;
    }
    
    // Take the first 6 digits and join them into a string
    return availableDigits.slice(0, 6).join('');
}

module.exports = generateCode;