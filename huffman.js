// ================================================
// HUFFMAN ENCODER/DECODER - OPTIMIZED & LAG-FREE
// Student: F23040113
// ================================================

'use strict';

// ================================================
// STATE MANAGEMENT
// ================================================

const state = {
    encode: {
        file: null,
        content: null,
        frequencyMap: null,
        huffmanTree: null,
        huffmanCodes: null,
        encodedBits: null,
        encodedData: null
    },
    decode: {
        file: null,
        content: null,
        decodedContent: null
    }
};

// ================================================
// HUFFMAN NODE CLASS
// ================================================

class HuffmanNode {
    constructor(char, freq) {
        this.char = char;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }
}

// ================================================
// CORE HUFFMAN ALGORITHM
// ================================================

function calculateFrequencies(text) {
    const freqMap = new Map();
    for (let char of text) {
        freqMap.set(char, (freqMap.get(char) || 0) + 1);
    }
    return freqMap;
}

function buildHuffmanTree(freqMap) {
    const nodes = Array.from(freqMap.entries())
        .map(([char, freq]) => new HuffmanNode(char, freq));
    
    if (nodes.length === 0) return null;
    if (nodes.length === 1) return nodes[0];
    
    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq);
        
        const left = nodes.shift();
        const right = nodes.shift();
        
        const parent = new HuffmanNode(null, left.freq + right.freq);
        parent.left = left;
        parent.right = right;
        
        nodes.push(parent);
    }
    
    return nodes[0];
}

function generateCodes(root, code = '', codes = new Map()) {
    if (!root) return codes;
    
    if (!root.left && !root.right) {
        codes.set(root.char, code || '0');
        return codes;
    }
    
    generateCodes(root.left, code + '0', codes);
    generateCodes(root.right, code + '1', codes);
    
    return codes;
}

function encodeText(text, codes) {
    return text.split('').map(char => codes.get(char)).join('');
}

function decodeText(bits, root) {
    if (!root) return '';
    
    if (!root.left && !root.right) {
        return root.char.repeat(bits.length);
    }
    
    let decoded = '';
    let current = root;
    
    for (let bit of bits) {
        current = bit === '0' ? current.left : current.right;
        
        if (!current.left && !current.right) {
            decoded += current.char;
            current = root;
        }
    }
    
    return decoded;
}

// ================================================
// FILE HANDLING - ENCODE (OPTIMIZED)
// ================================================

const encodeFileInput = document.getElementById('encodeFileInput');
const encodeUploadZone = document.getElementById('encodeUploadZone');

// File input change - direct handler
encodeFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleEncodeFile(file);
});

// Optimized drag and drop - prevent all conflicts
let dragCounter = 0;

encodeUploadZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    encodeUploadZone.classList.add('drag-over');
});

encodeUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

encodeUploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter === 0) {
        encodeUploadZone.classList.remove('drag-over');
    }
});

encodeUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    encodeUploadZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleEncodeFile(files[0]);
    }
});

// Click handler - only on upload area, not buttons
encodeUploadZone.addEventListener('click', (e) => {
    // Don't interfere with remove button (it has its own onclick)
    if (e.target.closest('.btn-remove')) {
        return; // Let the onclick handler work
    }
    
    // Don't trigger if clicking browse button
    if (e.target.closest('.btn-upload')) {
        return; // Let the onclick handler work
    }
    
    // Don't trigger on file input itself
    if (e.target === encodeFileInput) return;
    
    // Don't trigger if clicking inside file preview area
    if (e.target.closest('.file-preview')) return;
    
    // Don't trigger if file already selected
    if (state.encode.file) return;
    
    // Only trigger file input if clicking the upload-content area
    if (e.target.closest('.upload-content') || e.target === encodeUploadZone) {
        encodeFileInput.click();
    }
});

function handleEncodeFile(file) {
    if (!file.name.endsWith('.txt')) {
        showToast('Please select a .txt file', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showToast('File too large (max 10 MB)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        state.encode.file = file;
        state.encode.content = e.target.result;
        
        displayEncodeFile(file, state.encode.content);
        
        // Show file content
        document.getElementById('encodeContent').textContent = state.encode.content;
        document.getElementById('encodeContentViewer').style.display = 'block';
        
        document.getElementById('encodeBtn').disabled = false;
        document.getElementById('encodeResults').style.display = 'none';
    };
    reader.readAsText(file);
}

function displayEncodeFile(file, content) {
    document.getElementById('encodeUploadContent').style.display = 'none';
    document.getElementById('encodeFilePreview').style.display = 'flex';
    document.getElementById('encodeFileName').textContent = file.name;
    document.getElementById('encodeFileSize').textContent = formatFileSize(file.size);
    document.getElementById('encodeFileChars').textContent = `${content.length.toLocaleString()} characters`;
}

function clearEncodeFile() {
    state.encode = {
        file: null,
        content: null,
        frequencyMap: null,
        huffmanTree: null,
        huffmanCodes: null,
        encodedBits: null,
        encodedData: null
    };
    
    encodeFileInput.value = '';
    document.getElementById('encodeUploadContent').style.display = 'block';
    document.getElementById('encodeFilePreview').style.display = 'none';
    document.getElementById('encodeBtn').disabled = true;
    document.getElementById('encodeResults').style.display = 'none';
    document.getElementById('encodeContentViewer').style.display = 'none';
    document.getElementById('compressedContentViewer').style.display = 'none';
}

// ================================================
// FILE HANDLING - DECODE (OPTIMIZED)
// ================================================

const decodeFileInput = document.getElementById('decodeFileInput');
const decodeUploadZone = document.getElementById('decodeUploadZone');

let decodeDragCounter = 0;

decodeFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleDecodeFile(file);
});

decodeUploadZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    decodeDragCounter++;
    decodeUploadZone.classList.add('drag-over');
});

decodeUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

decodeUploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    decodeDragCounter--;
    if (decodeDragCounter === 0) {
        decodeUploadZone.classList.remove('drag-over');
    }
});

decodeUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    decodeDragCounter = 0;
    decodeUploadZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleDecodeFile(files[0]);
    }
});

decodeUploadZone.addEventListener('click', (e) => {
    // Don't interfere with remove button (it has its own onclick)
    if (e.target.closest('.btn-remove')) {
        return; // Let the onclick handler work
    }
    
    // Don't trigger if clicking browse button
    if (e.target.closest('.btn-upload')) {
        return; // Let the onclick handler work
    }
    
    // Don't trigger on file input itself
    if (e.target === decodeFileInput) return;
    
    // Don't trigger if clicking inside file preview area
    if (e.target.closest('.file-preview')) return;
    
    // Don't trigger if file already selected
    if (state.decode.file) return;
    
    // Only trigger file input if clicking the upload-content area
    if (e.target.closest('.upload-content') || e.target === decodeUploadZone) {
        decodeFileInput.click();
    }
});

function handleDecodeFile(file) {
    if (!file.name.endsWith('.huff')) {
        showToast('Please select a .huff file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            const data = JSON.parse(content);
            
            if (!data.encoded || !data.tree) {
                throw new Error('Invalid file format');
            }
            
            state.decode.file = file;
            state.decode.content = data;
            
            displayDecodeFile(file);
            
            // Show encoded binary content
            document.getElementById('decodeEncodedContent').textContent = data.encoded;
            document.getElementById('decodeContentViewer').style.display = 'block';
            
            document.getElementById('decodeBtn').disabled = false;
            document.getElementById('decodeResults').style.display = 'none';
        } catch (error) {
            showToast('Invalid encoded file', 'error');
        }
    };
    reader.readAsText(file);
}

function displayDecodeFile(file) {
    document.getElementById('decodeUploadContent').style.display = 'none';
    document.getElementById('decodeFilePreview').style.display = 'flex';
    document.getElementById('decodeFileName').textContent = file.name;
    document.getElementById('decodeFileSize').textContent = formatFileSize(file.size);
}

function clearDecodeFile() {
    state.decode = {
        file: null,
        content: null,
        decodedContent: null
    };
    
    decodeFileInput.value = '';
    document.getElementById('decodeUploadContent').style.display = 'block';
    document.getElementById('decodeFilePreview').style.display = 'none';
    document.getElementById('decodeBtn').disabled = true;
    document.getElementById('decodeResults').style.display = 'none';
    document.getElementById('decodeContentViewer').style.display = 'none';
    document.getElementById('decompressedContentViewer').style.display = 'none';
}

// ================================================
// ENCODE FUNCTION
// ================================================

async function performEncode() {
    const btn = document.getElementById('encodeBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    
    btn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        state.encode.frequencyMap = calculateFrequencies(state.encode.content);
        state.encode.huffmanTree = buildHuffmanTree(state.encode.frequencyMap);
        state.encode.huffmanCodes = generateCodes(state.encode.huffmanTree);
        state.encode.encodedBits = encodeText(state.encode.content, state.encode.huffmanCodes);
        
        state.encode.encodedData = {
            encoded: state.encode.encodedBits,
            tree: serializeTree(state.encode.huffmanTree),
            originalName: state.encode.file.name
        };
        
        displayEncodeResults();
        showToast('File compressed successfully!', 'success');
        
    } catch (error) {
        showToast('Encoding failed: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnSpinner.style.display = 'none';
    }
}

function displayEncodeResults() {
    const originalBits = state.encode.content.length * 8;
    const compressedBits = state.encode.encodedBits.length;
    const savedBits = originalBits - compressedBits;
    const ratio = ((savedBits / originalBits) * 100).toFixed(2);
    
    document.getElementById('encodeOriginalSize').textContent = formatBits(originalBits);
    document.getElementById('encodeCompressedSize').textContent = formatBits(compressedBits);
    document.getElementById('encodeRatio').textContent = ratio + '%';
    document.getElementById('encodeUniqueChars').textContent = state.encode.frequencyMap.size;
    
    // Show compressed binary content
    document.getElementById('compressedContent').textContent = state.encode.encodedBits;
    document.getElementById('compressedContentViewer').style.display = 'block';
    
    document.getElementById('encodeResults').style.display = 'block';
    document.getElementById('encodeResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ================================================
// DECODE FUNCTION
// ================================================

async function performDecode() {
    const btn = document.getElementById('decodeBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    
    btn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        const tree = deserializeTree(state.decode.content.tree);
        state.decode.decodedContent = decodeText(state.decode.content.encoded, tree);
        
        displayDecodeResults();
        showToast('File decompressed successfully!', 'success');
        
    } catch (error) {
        showToast('Decoding failed: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnSpinner.style.display = 'none';
    }
}

function displayDecodeResults() {
    const compressedBits = state.decode.content.encoded.length;
    const originalBits = state.decode.decodedContent.length * 8;
    
    document.getElementById('decodeCompressedSize').textContent = formatBits(compressedBits);
    document.getElementById('decodeOriginalSize').textContent = formatBits(originalBits);
    document.getElementById('decodeCharsRestored').textContent = state.decode.decodedContent.length.toLocaleString();
    
    // Show decompressed text content
    document.getElementById('decompressedContent').textContent = state.decode.decodedContent;
    document.getElementById('decompressedContentViewer').style.display = 'block';
    
    document.getElementById('decodeResults').style.display = 'block';
    document.getElementById('decodeResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ================================================
// TREE SERIALIZATION
// ================================================

function serializeTree(node) {
    if (!node) return null;
    
    if (!node.left && !node.right) {
        return { char: node.char, freq: node.freq };
    }
    
    return {
        freq: node.freq,
        left: serializeTree(node.left),
        right: serializeTree(node.right)
    };
}

function deserializeTree(data) {
    if (!data) return null;
    
    const node = new HuffmanNode(data.char || null, data.freq);
    
    if (data.left) node.left = deserializeTree(data.left);
    if (data.right) node.right = deserializeTree(data.right);
    
    return node;
}

// ================================================
// DOWNLOAD FUNCTIONS
// ================================================

function downloadEncoded() {
    const dataStr = JSON.stringify(state.encode.encodedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const filename = state.encode.file.name.replace('.txt', '') + '.huff';
    downloadBlob(blob, filename);
    showToast('Compressed file downloaded!', 'success');
}

function downloadDecoded() {
    const blob = new Blob([state.decode.decodedContent], { type: 'text/plain' });
    const filename = state.decode.content.originalName || 'decoded.txt';
    downloadBlob(blob, filename);
    showToast('Original file downloaded!', 'success');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ================================================
// VIEW TABLES
// ================================================

function viewTable(type) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (type === 'frequency') {
        modalTitle.textContent = '📊 Character Frequency Table';
        modalBody.innerHTML = generateFrequencyTable();
    } else if (type === 'codes') {
        modalTitle.textContent = '🔢 Huffman Codes Table';
        modalBody.innerHTML = generateCodesTable();
    }
    
    modalOverlay.classList.add('active');
}

function generateFrequencyTable() {
    const sorted = Array.from(state.encode.frequencyMap.entries())
        .sort((a, b) => b[1] - a[1]);
    
    const total = state.encode.content.length;
    
    let html = '<table class="data-table"><thead><tr>';
    html += '<th>Character</th><th>ASCII</th><th>Frequency</th><th>Percentage</th>';
    html += '</tr></thead><tbody>';
    
    for (let [char, freq] of sorted) {
        const displayChar = getDisplayChar(char);
        const percentage = ((freq / total) * 100).toFixed(2);
        
        html += '<tr>';
        html += `<td><strong>${displayChar}</strong></td>`;
        html += `<td>${char.charCodeAt(0)}</td>`;
        html += `<td>${freq}</td>`;
        html += `<td>${percentage}%</td>`;
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    return html;
}

function generateCodesTable() {
    const sorted = Array.from(state.encode.huffmanCodes.entries())
        .sort((a, b) => a[1].length - b[1].length);
    
    let html = '<table class="data-table"><thead><tr>';
    html += '<th>Character</th><th>Frequency</th><th>Huffman Code</th><th>Bits</th>';
    html += '</tr></thead><tbody>';
    
    for (let [char, code] of sorted) {
        const displayChar = getDisplayChar(char);
        const freq = state.encode.frequencyMap.get(char);
        
        html += '<tr>';
        html += `<td><strong>${displayChar}</strong></td>`;
        html += `<td>${freq}</td>`;
        html += `<td class="code-cell">${code}</td>`;
        html += `<td>${code.length}</td>`;
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    return html;
}

function getDisplayChar(char) {
    if (char === '\n') return '\\n (newline)';
    if (char === '\t') return '\\t (tab)';
    if (char === ' ') return '(space)';
    if (char === '\r') return '\\r (return)';
    return char;
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ================================================
// TAB SWITCHING
// ================================================

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// ================================================
// TOAST NOTIFICATIONS
// ================================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✅' : '❌';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.5s ease reverse';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatBits(bits) {
    if (bits < 8) return bits + ' bits';
    const bytes = bits / 8;
    if (bytes < 1024) return bytes.toFixed(2) + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ================================================
// KEYBOARD SHORTCUTS
// ================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ================================================
// COPY TO CLIPBOARD
// ================================================

function copyContent(elementId) {
    const content = document.getElementById(elementId).textContent;
    
    navigator.clipboard.writeText(content).then(() => {
        showToast('Content copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Content copied to clipboard!', 'success');
    });
}

// ================================================
// INITIALIZATION
// ================================================

console.log('🚀 Huffman Encoder/Decoder - Optimized & Lag-Free!');
console.log('📚 Student ID: F23040113');
console.log('✨ Ready to compress!');
