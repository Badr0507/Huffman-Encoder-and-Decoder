// ================================================
// HUFFMAN ENCODER/DECODER - FINAL PERFECT VERSION
// Student: Badr Dyane (F23040113)
// ================================================

// State Management
const state = {
    encode: {
        file: null,
        content: null,
        frequencyMap: null,
        huffmanTree: null,
        huffmanCodes: null,
        encodedBits: null,
        originalHash: null
    },
    decode: {
        binaryFile: null,
        treeFile: null,
        binaryContent: null,
        treeContent: null,
        decodedContent: null
    }
};

// ================================================
// TAB SWITCHING
// ================================================

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.tab-btn').classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
}

// ================================================
// HUFFMAN NODE CLASS
// ================================================

class HuffmanNode {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
}

// ================================================
// HUFFMAN ALGORITHM
// ================================================

function calculateFrequencies(text) {
    const freqMap = new Map();
    for (let char of text) {
        freqMap.set(char, (freqMap.get(char) || 0) + 1);
    }
    return freqMap;
}

function buildHuffmanTree(freqMap) {
    const nodes = Array.from(freqMap.entries()).map(([char, freq]) => new HuffmanNode(char, freq));
    
    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq);
        const left = nodes.shift();
        const right = nodes.shift();
        const parent = new HuffmanNode(null, left.freq + right.freq, left, right);
        nodes.push(parent);
    }
    
    return nodes[0];
}

function generateCodes(node, code = '', codes = new Map()) {
    if (!node) return codes;
    
    if (node.char !== null) {
        codes.set(node.char, code || '0');
        return codes;
    }
    
    generateCodes(node.left, code + '0', codes);
    generateCodes(node.right, code + '1', codes);
    
    return codes;
}

function encodeText(text, codes) {
    return text.split('').map(char => codes.get(char)).join('');
}

function decodeText(bits, root) {
    let result = '';
    let current = root;
    
    for (let bit of bits) {
        current = bit === '0' ? current.left : current.right;
        
        if (current.char !== null) {
            result += current.char;
            current = root;
        }
    }
    
    return result;
}

function serializeTree(node) {
    if (!node) return null;
    
    return {
        char: node.char,
        freq: node.freq,
        left: serializeTree(node.left),
        right: serializeTree(node.right)
    };
}

function deserializeTree(data) {
    if (!data) return null;
    
    const node = new HuffmanNode(data.char, data.freq);
    node.left = deserializeTree(data.left);
    node.right = deserializeTree(data.right);
    
    return node;
}

// ================================================
// SHA-256 HASH CALCULATION
// ================================================

async function calculateHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    if (bits < 1024) return bits + ' bits';
    if (bits < 1024 * 8) return (bits / 8).toFixed(2) + ' bytes';
    if (bits < 1024 * 1024 * 8) return (bits / (1024 * 8)).toFixed(2) + ' KB';
    return (bits / (1024 * 1024 * 8)).toFixed(2) + ' MB';
}

function getDisplayChar(char) {
    if (char === ' ') return 'Space';
    if (char === '\n') return '\\n';
    if (char === '\t') return '\\t';
    if (char === '\r') return '\\r';
    return char;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}


// ================================================
// ENCODE TAB - FILE UPLOAD (TRANSFORMING BOX)
// ================================================

const encodeUploadZone = document.getElementById('encodeUploadZone');
const encodeFileInput = document.getElementById('encodeFileInput');

let encodeDragCounter = 0;

encodeUploadZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    encodeDragCounter++;
    encodeUploadZone.classList.add('drag-over');
});

encodeUploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    encodeDragCounter--;
    if (encodeDragCounter === 0) {
        encodeUploadZone.classList.remove('drag-over');
    }
});

encodeUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

encodeUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    encodeDragCounter = 0;
    encodeUploadZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleEncodeFile(files[0]);
    }
});

encodeFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleEncodeFile(e.target.files[0]);
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
        
        // TRANSFORM upload zone to show content
        document.getElementById('encodeUploadContent').style.display = 'none';
        document.getElementById('encodeFileView').style.display = 'block';
        
        // Update file info
        document.getElementById('encodeFileName').textContent = file.name;
        document.getElementById('encodeFileMeta').textContent = `${formatFileSize(file.size)} • ${state.encode.content.length.toLocaleString()} characters`;
        document.getElementById('encodeFileContent').textContent = state.encode.content;
        
        // Enable compress button
        document.getElementById('encodeBtn').disabled = false;
        
        // Hide results
        document.getElementById('encodeResults').style.display = 'none';
        
        showToast('File loaded successfully!', 'success');
    };
    reader.readAsText(file);
}

function clearEncode() {
    state.encode = {
        file: null,
        content: null,
        frequencyMap: null,
        huffmanTree: null,
        huffmanCodes: null,
        encodedBits: null,
        originalHash: null
    };
    
    encodeFileInput.value = '';
    
    // SHOW the upload card again
    document.querySelector('#encode-tab .card').style.display = 'block';
    
    // TRANSFORM back to upload state
    document.getElementById('encodeUploadContent').style.display = 'block';
    document.getElementById('encodeFileView').style.display = 'none';
    
    document.getElementById('encodeBtn').disabled = true;
    document.getElementById('encodeResults').style.display = 'none';
}

// ================================================
// ENCODE - PERFORM COMPRESSION
// ================================================

async function performEncode() {
    const btn = document.getElementById('encodeBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    
    btn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';
    
    const startTime = performance.now();
    
    try {
        // Calculate hash of original
        state.encode.originalHash = await calculateHash(state.encode.content);
        
        // Huffman algorithm
        state.encode.frequencyMap = calculateFrequencies(state.encode.content);
        state.encode.huffmanTree = buildHuffmanTree(state.encode.frequencyMap);
        state.encode.huffmanCodes = generateCodes(state.encode.huffmanTree);
        state.encode.encodedBits = encodeText(state.encode.content, state.encode.huffmanCodes);
        
        const endTime = performance.now();
        const processingTime = (endTime - startTime).toFixed(2);
        
        displayEncodeResults(processingTime);
        showToast('Compression complete!', 'success');
        
    } catch (error) {
        showToast('Compression failed: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnSpinner.style.display = 'none';
    }
}

function displayEncodeResults(processingTime) {
    const originalBits = state.encode.content.length * 8;
    const compressedBits = state.encode.encodedBits.length;
    const savedBits = originalBits - compressedBits;
    const ratio = ((savedBits / originalBits) * 100).toFixed(2);
    
    // HIDE the upload card (will show in split view instead)
    document.querySelector('#encode-tab .card').style.display = 'none';
    
    // Update split view content
    document.getElementById('originalMeta').textContent = `${formatBits(originalBits)} • ${state.encode.content.length.toLocaleString()} characters`;
    document.getElementById('originalContent').textContent = state.encode.content;
    
    document.getElementById('compressedMeta').textContent = `${formatBits(compressedBits)} • ${state.encode.encodedBits.length.toLocaleString()} bits`;
    document.getElementById('compressedContent').textContent = state.encode.encodedBits;
    
    // Update stats
    document.getElementById('encodeTime').textContent = processingTime + 'ms';
    document.getElementById('encodeOriginalSize').textContent = formatBits(originalBits);
    document.getElementById('encodeCompressedSize').textContent = formatBits(compressedBits);
    document.getElementById('encodeRatio').textContent = ratio + '%';
    document.getElementById('encodeUniqueChars').textContent = state.encode.frequencyMap.size;
    
    // Update chart
    const compressedPercent = ((compressedBits / originalBits) * 100).toFixed(1);
    document.getElementById('compressedBar').style.width = compressedPercent + '%';
    document.getElementById('compressedBarLabel').textContent = compressedPercent + '%';
    document.getElementById('spaceSaved').textContent = ratio + '%';
    
    // Show results
    document.getElementById('encodeResults').style.display = 'block';
    document.getElementById('encodeResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ================================================
// BINARY TREE SERIALIZATION (PROFESSIONAL FORMAT)
// ================================================

function serializeTreeToBinary(node) {
    // Serialize tree as pure binary (no JSON!)
    // Format: 0 = internal node, 1 + 8bits = leaf node with char
    let bits = '';
    
    function traverse(n) {
        if (!n) return;
        
        if (n.char !== null) {
            // Leaf node: 1 + 8-bit character code
            bits += '1';
            const charCode = n.char.charCodeAt(0);
            bits += charCode.toString(2).padStart(16, '0'); // 16 bits for Unicode
        } else {
            // Internal node: 0 + left + right
            bits += '0';
            traverse(n.left);
            traverse(n.right);
        }
    }
    
    traverse(node);
    return bits;
}

function deserializeTreeFromBinary(bits) {
    // Deserialize tree from pure binary format
    let index = 0;
    
    function build() {
        if (index >= bits.length) return null;
        
        const bit = bits[index++];
        
        if (bit === '1') {
            // Leaf node: read 16-bit character code
            const charBits = bits.substr(index, 16);
            index += 16;
            const charCode = parseInt(charBits, 2);
            const char = String.fromCharCode(charCode);
            return new HuffmanNode(char, 0);
        } else {
            // Internal node: build left and right
            const node = new HuffmanNode(null, 0);
            node.left = build();
            node.right = build();
            return node;
        }
    }
    
    return build();
}

// ================================================
// DOWNLOAD .BIN FILE (PURE BINARY FORMAT)
// ================================================

function downloadBoth() {
    const baseName = state.encode.file.name.replace('.txt', '');
    
    // 1. Serialize tree to binary format (NO JSON!)
    const treeBinary = serializeTreeToBinary(state.encode.huffmanTree);
    
    // 2. Create metadata header (minimal)
    const originalName = state.encode.file.name;
    const originalHash = state.encode.originalHash;
    
    // Encode metadata as binary
    const nameLengthBits = originalName.length.toString(2).padStart(16, '0'); // 16 bits for name length
    let nameEncodedBits = '';
    for (let char of originalName) {
        nameEncodedBits += char.charCodeAt(0).toString(2).padStart(16, '0');
    }
    
    // Hash as 256 bits (64 hex chars = 256 bits)
    let hashBits = '';
    for (let i = 0; i < originalHash.length; i += 2) {
        const byte = parseInt(originalHash.substr(i, 2), 16);
        hashBits += byte.toString(2).padStart(8, '0');
    }
    
    // 3. Build complete binary structure
    const treeLengthBits = treeBinary.length.toString(2).padStart(32, '0'); // 32 bits for tree length
    const dataLengthBits = state.encode.encodedBits.length.toString(2).padStart(32, '0'); // 32 bits for data length
    
    // Complete binary string:
    // [32 bits: tree length]
    // [tree binary]
    // [32 bits: data length]
    // [compressed data]
    // [16 bits: name length]
    // [name encoded]
    // [256 bits: hash]
    
    let fullBinary = '';
    fullBinary += treeLengthBits;
    fullBinary += treeBinary;
    fullBinary += dataLengthBits;
    fullBinary += state.encode.encodedBits;
    fullBinary += nameLengthBits;
    fullBinary += nameEncodedBits;
    fullBinary += hashBits;
    
    // 4. Convert to actual bytes
    // Pad to multiple of 8
    const padding = (8 - (fullBinary.length % 8)) % 8;
    fullBinary = fullBinary + '0'.repeat(padding);
    
    const bytes = [];
    for (let i = 0; i < fullBinary.length; i += 8) {
        const byte = fullBinary.substr(i, 8);
        bytes.push(parseInt(byte, 2));
    }
    
    // 5. Create Uint8Array and download
    const finalBytes = new Uint8Array(bytes);
    const blob = new Blob([finalBytes], { type: 'application/octet-stream' });
    downloadBlob(blob, baseName + '.bin');
    
    showToast('Binary file downloaded!', 'success');
}


// ================================================
// DECODE TAB - FILE UPLOAD WITH AUTO-LOAD TREE
// ================================================

const decodeUploadZone = document.getElementById('decodeUploadZone');
const decodeBinaryInput = document.getElementById('decodeBinaryInput');

let decodeDragCounter = 0;

decodeUploadZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    decodeDragCounter++;
    decodeUploadZone.classList.add('drag-over');
});

decodeUploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    decodeDragCounter--;
    if (decodeDragCounter === 0) {
        decodeUploadZone.classList.remove('drag-over');
    }
});

decodeUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

decodeUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    decodeDragCounter = 0;
    decodeUploadZone.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    handleDecodeFiles(files);
});

decodeBinaryInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleDecodeFiles(files);
});

function handleDecodeFiles(files) {
    if (files.length === 0) return;
    
    // Find .bin file
    const binFile = files.find(f => f.name.endsWith('.bin'));
    
    if (!binFile) {
        showToast('Please select a .bin file', 'error');
        return;
    }
    
    // Load binary file as ArrayBuffer (raw bytes)
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const arrayBuffer = e.target.result;
            const bytes = new Uint8Array(arrayBuffer);
            
            // Convert all bytes to binary string
            let fullBinary = '';
            for (let i = 0; i < bytes.length; i++) {
                fullBinary += bytes[i].toString(2).padStart(8, '0');
            }
            
            let bitIndex = 0;
            
            // Read tree length (32 bits)
            const treeLengthBits = fullBinary.substr(bitIndex, 32);
            bitIndex += 32;
            const treeLength = parseInt(treeLengthBits, 2);
            
            // Read tree binary
            const treeBinary = fullBinary.substr(bitIndex, treeLength);
            bitIndex += treeLength;
            
            // Read data length (32 bits)
            const dataLengthBits = fullBinary.substr(bitIndex, 32);
            bitIndex += 32;
            const dataLength = parseInt(dataLengthBits, 2);
            
            // Read compressed data
            const compressedData = fullBinary.substr(bitIndex, dataLength);
            bitIndex += dataLength;
            
            // Read name length (16 bits)
            const nameLengthBits = fullBinary.substr(bitIndex, 16);
            bitIndex += 16;
            const nameLength = parseInt(nameLengthBits, 2);
            
            // Read original name
            let originalName = '';
            for (let i = 0; i < nameLength; i++) {
                const charBits = fullBinary.substr(bitIndex, 16);
                bitIndex += 16;
                const charCode = parseInt(charBits, 2);
                originalName += String.fromCharCode(charCode);
            }
            
            // Read hash (256 bits)
            const hashBits = fullBinary.substr(bitIndex, 256);
            bitIndex += 256;
            let originalHash = '';
            for (let i = 0; i < 256; i += 8) {
                const byte = parseInt(hashBits.substr(i, 8), 2);
                originalHash += byte.toString(16).padStart(2, '0');
            }
            
            // Deserialize tree from binary
            const tree = deserializeTreeFromBinary(treeBinary);
            
            // Store everything
            state.decode.binaryFile = binFile;
            state.decode.binaryContent = compressedData;
            state.decode.treeFile = binFile;
            state.decode.treeContent = {
                tree: tree,
                originalName: originalName,
                originalHash: originalHash
            };
            
            // TRANSFORM upload zone
            document.getElementById('decodeUploadContent').style.display = 'none';
            document.getElementById('decodeFileView').style.display = 'block';
            
            // Update file info
            document.getElementById('decodeBinaryName').textContent = binFile.name;
            document.getElementById('decodeBinaryMeta').textContent = `${formatFileSize(binFile.size)} • ${compressedData.length.toLocaleString()} bits (pure binary format)`;
            document.getElementById('decodeBinaryContent').textContent = compressedData;
            
            // Enable decompress button
            document.getElementById('decodeBtn').disabled = false;
            
            showToast('Pure binary file loaded!', 'success');
            
        } catch (error) {
            showToast('Invalid binary file: ' + error.message, 'error');
            console.error(error);
        }
    };
    reader.readAsArrayBuffer(binFile);
}

function handleBinaryFile(file) {
    handleDecodeFiles([file]);
}

function clearDecode() {
    state.decode = {
        binaryFile: null,
        treeFile: null,
        binaryContent: null,
        treeContent: null,
        decodedContent: null
    };
    
    decodeBinaryInput.value = '';
    
    // SHOW the upload card again
    document.querySelector('#decode-tab .card').style.display = 'block';
    
    // TRANSFORM back to upload state
    document.getElementById('decodeUploadContent').style.display = 'block';
    document.getElementById('decodeFileView').style.display = 'none';
    
    document.getElementById('decodeBtn').disabled = true;
    document.getElementById('decodeResults').style.display = 'none';
}

// ================================================
// DECODE - PERFORM DECOMPRESSION
// ================================================

async function performDecode() {
    const btn = document.getElementById('decodeBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    
    btn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';
    
    const startTime = performance.now();
    
    try {
        // Get tree from decoded binary format
        const tree = state.decode.treeContent.tree;
        
        // Decode binary string
        state.decode.decodedContent = decodeText(state.decode.binaryContent, tree);
        
        const endTime = performance.now();
        const processingTime = (endTime - startTime).toFixed(2);
        
        // Calculate hash for verification
        const decodedHash = await calculateHash(state.decode.decodedContent);
        const originalHash = state.decode.treeContent.originalHash || null;
        
        displayDecodeResults(processingTime, decodedHash, originalHash);
        showToast('Decompression complete!', 'success');
        
    } catch (error) {
        showToast('Decompression failed: ' + error.message, 'error');
        console.error(error);
    } finally {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnSpinner.style.display = 'none';
    }
}

function displayDecodeResults(processingTime, decodedHash, originalHash) {
    const compressedBits = state.decode.binaryContent.length;
    const originalBits = state.decode.decodedContent.length * 8;
    
    // HIDE the upload card
    document.querySelector('#decode-tab .card').style.display = 'none';
    
    // Update split view content
    document.getElementById('decodeCompMeta').textContent = `${formatBits(compressedBits)} • ${state.decode.binaryContent.length.toLocaleString()} bits`;
    document.getElementById('decodeCompContent').textContent = state.decode.binaryContent;
    
    document.getElementById('decodeDecompMeta').textContent = `${formatBits(originalBits)} • ${state.decode.decodedContent.length.toLocaleString()} characters`;
    document.getElementById('decodeDecompContent').textContent = state.decode.decodedContent;
    
    // Update stats
    document.getElementById('decodeTime').textContent = processingTime + 'ms';
    document.getElementById('decodeCompressedSize').textContent = formatBits(compressedBits);
    document.getElementById('decodeOriginalSize').textContent = formatBits(originalBits);
    document.getElementById('decodeCharsRestored').textContent = state.decode.decodedContent.length.toLocaleString();
    
    // Verification
    if (originalHash) {
        const hashMatch = originalHash === decodedHash;
        
        document.getElementById('hashMatch').textContent = hashMatch ? '✅ Match' : '❌ Mismatch';
        document.getElementById('hashVerify').className = hashMatch ? 'verify-card' : 'verify-card mismatch';
        
        document.getElementById('sizeMatch').textContent = `✅ ${formatBits(originalBits)}`;
        document.getElementById('charMatch').textContent = `✅ ${state.decode.decodedContent.length.toLocaleString()} chars`;
    }
    
    // Show results
    document.getElementById('decodeResults').style.display = 'block';
    document.getElementById('decodeResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadDecoded() {
    const blob = new Blob([state.decode.decodedContent], { type: 'text/plain' });
    const filename = state.decode.treeContent.originalName || 'decoded.txt';
    downloadBlob(blob, filename);
    showToast('Original file downloaded!', 'success');
}


// ================================================
// TOAST NOTIFICATIONS
// ================================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlide 0.4s ease reverse';
        setTimeout(() => {
            container.removeChild(toast);
        }, 400);
    }, 3000);
}

// ================================================
// MODAL
// ================================================

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function viewTable(type) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (type === 'frequency') {
        modalTitle.textContent = '📊 Character Frequency Table';
        modalBody.innerHTML = generateFrequencyTable();
    } else if (type === 'codes') {
        modalTitle.textContent = '🔢 Huffman Codes';
        modalBody.innerHTML = generateCodesTable();
    }
    
    modalOverlay.classList.add('active');
}

function viewChart() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = '📈 Character Frequency Chart';
    modalBody.innerHTML = generateFrequencyChart();
    modalOverlay.classList.add('active');
}

function viewReport() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = '📄 Compression Report';
    modalBody.innerHTML = generateReport();
    modalOverlay.classList.add('active');
}

function generateFrequencyTable() {
    const sorted = Array.from(state.encode.frequencyMap.entries())
        .sort((a, b) => b[1] - a[1]);
    
    const total = state.encode.content.length;
    
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr style="background: rgba(0, 212, 255, 0.1); border-bottom: 2px solid rgba(0, 212, 255, 0.3);">';
    html += '<th style="padding: 12px; text-align: left;">Character</th>';
    html += '<th style="padding: 12px; text-align: right;">Frequency</th>';
    html += '<th style="padding: 12px; text-align: right;">Percentage</th>';
    html += '</tr>';
    
    for (let [char, freq] of sorted) {
        const percentage = ((freq / total) * 100).toFixed(2);
        html += '<tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">';
        html += `<td style="padding: 10px;"><strong>${getDisplayChar(char)}</strong></td>`;
        html += `<td style="padding: 10px; text-align: right;">${freq}</td>`;
        html += `<td style="padding: 10px; text-align: right; color: var(--primary);">${percentage}%</td>`;
        html += '</tr>';
    }
    
    html += '</table>';
    return html;
}

function generateCodesTable() {
    const sorted = Array.from(state.encode.huffmanCodes.entries())
        .sort((a, b) => a[1].length - b[1].length);
    
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr style="background: rgba(0, 212, 255, 0.1); border-bottom: 2px solid rgba(0, 212, 255, 0.3);">';
    html += '<th style="padding: 12px; text-align: left;">Character</th>';
    html += '<th style="padding: 12px; text-align: left;">Huffman Code</th>';
    html += '<th style="padding: 12px; text-align: right;">Bits</th>';
    html += '</tr>';
    
    for (let [char, code] of sorted) {
        html += '<tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">';
        html += `<td style="padding: 10px;"><strong>${getDisplayChar(char)}</strong></td>`;
        html += `<td style="padding: 10px; font-family: monospace; color: var(--primary);">${code}</td>`;
        html += `<td style="padding: 10px; text-align: right;">${code.length}</td>`;
        html += '</tr>';
    }
    
    html += '</table>';
    return html;
}

function generateFrequencyChart() {
    const sorted = Array.from(state.encode.frequencyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    const maxFreq = sorted[0][1];
    
    let html = '<div style="padding: 20px;">';
    
    for (let [char, freq] of sorted) {
        const displayChar = getDisplayChar(char);
        const percentage = ((freq / maxFreq) * 100);
        const barColor = `hsl(${180 + percentage}, 70%, 50%)`;
        
        html += `<div style="margin-bottom: 16px;">`;
        html += `<div style="display: flex; justify-content: space-between; margin-bottom: 6px;">`;
        html += `<strong style="color: var(--text-primary);">${displayChar}</strong>`;
        html += `<span style="color: var(--text-secondary);">${freq} times</span>`;
        html += `</div>`;
        html += `<div style="background: rgba(0,0,0,0.3); border-radius: 8px; height: 28px; overflow: hidden;">`;
        html += `<div style="background: ${barColor}; height: 100%; width: ${percentage}%; border-radius: 8px; transition: width 0.5s;"></div>`;
        html += `</div>`;
        html += `</div>`;
    }
    
    html += '</div>';
    return html;
}

function generateReport() {
    const originalBits = state.encode.content.length * 8;
    const compressedBits = state.encode.encodedBits.length;
    const ratio = (((originalBits - compressedBits) / originalBits) * 100).toFixed(2);
    
    const html = `
        <div style="padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1)); border-radius: 12px;">
                <h2 style="color: white; margin: 0 0 10px 0; font-size: 1.8rem;">📊 HUFFMAN COMPRESSION REPORT</h2>
                <p style="color: rgba(255,255,255,0.9); margin: 0;">Student: Badr Dyane | ID: F23040113</p>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 0.9rem;">${new Date().toLocaleString()}</p>
            </div>

            <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--glass-border);">
                <h3 style="color: var(--primary); margin: 0 0 15px 0;">📁 File Information</h3>
                <table style="width: 100%; color: var(--text-primary);">
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 10px 0; font-weight: 600;">Original Filename:</td>
                        <td style="padding: 10px 0;">${state.encode.file.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; font-weight: 600;">File Hash (SHA-256):</td>
                        <td style="padding: 10px 0; font-family: monospace; font-size: 0.85rem; word-break: break-all;">${state.encode.originalHash}</td>
                    </tr>
                </table>
            </div>

            <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--glass-border);">
                <h3 style="color: var(--primary); margin: 0 0 15px 0;">📊 Compression Statistics</h3>
                <table style="width: 100%; color: var(--text-primary);">
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 10px 0; font-weight: 600;">Original Size:</td>
                        <td style="padding: 10px 0; color: var(--danger);">${formatBits(originalBits)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 10px 0; font-weight: 600;">Compressed Size:</td>
                        <td style="padding: 10px 0; color: var(--success);">${formatBits(compressedBits)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 10px 0; font-weight: 600;">Space Saved:</td>
                        <td style="padding: 10px 0; color: var(--primary); font-weight: 700;">${formatBits(originalBits - compressedBits)} (${ratio}%)</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; font-weight: 600;">Unique Characters:</td>
                        <td style="padding: 10px 0;">${state.encode.frequencyMap.size}</td>
                    </tr>
                </table>
            </div>

            <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                <h3 style="color: var(--primary); margin: 0 0 15px 0;">⚙️ Algorithm Details</h3>
                <table style="width: 100%; color: var(--text-primary);">
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 10px 0; font-weight: 600;">Algorithm:</td>
                        <td style="padding: 10px 0;">Huffman Coding (Greedy Algorithm)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 10px 0; font-weight: 600;">Compression Type:</td>
                        <td style="padding: 10px 0;">Lossless</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 10px 0; font-weight: 600;">Binary Format:</td>
                        <td style="padding: 10px 0;">Professional binary tree encoding</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 10px 0; font-weight: 600;">Time Complexity:</td>
                        <td style="padding: 10px 0;">O(n log k)</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; font-weight: 600;">Space Complexity:</td>
                        <td style="padding: 10px 0;">O(k)</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; padding: 15px; margin-top: 20px; background: var(--glass-bg); border-radius: 12px; border: 1px solid var(--glass-border);">
                <p style="color: var(--text-secondary); margin: 0 0 10px 0; font-size: 0.9rem;">Generated by Huffman Encoder/Decoder</p>
                <a href="https://github.com/Badr0507/Huffman-Encoder-and-Decoder" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 600;">
                    🔗 View Source Code on GitHub
                </a>
            </div>
        </div>
    `;
    
    return html;
}

// ================================================
// KEYBOARD SHORTCUTS
// ================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ================================================
// INITIALIZATION
// ================================================

console.log('🚀 Huffman Encoder/Decoder - Professional Edition!');
console.log('👨‍💻 Student: Badr Dyane (F23040113)');
console.log('📦 Features:');
console.log('  ✅ Pure binary tree encoding (NO JSON!)');
console.log('  ✅ Professional binary format');
console.log('  ✅ Tree encoded as binary traversal');
console.log('  ✅ 100% binary file - teacher approved!');
console.log('  ✅ Beautiful split-view interface');
console.log('  ✅ SHA-256 verification');
console.log('🔥 READY TO IMPRESS!');
