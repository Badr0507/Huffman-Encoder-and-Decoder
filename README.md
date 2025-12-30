# 🗜️ Huffman Encoder/Decoder

**Student:** Badr Dyane  
**Student ID:** F23040113  
**Project:** Lossless Data Compression using Huffman Coding Algorithm

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://badr0507.github.io/Huffman-Encoder-and-Decoder/)
[![License](https://img.shields.io/badge/license-Educational-blue)]()

## 📌 Overview

A modern, feature-rich web application implementing the Huffman coding algorithm for lossless data compression. This project showcases both the theoretical understanding of compression algorithms and practical web development skills with a stunning dark-themed user interface featuring glassmorphism effects and smooth animations.

## ✨ Features

### Core Functionality
- 🗜️ **Encode (Compress)** - Compress text files using variable-length Huffman coding
- 📂 **Decode (Decompress)** - Perfectly restore original files (lossless compression)
- 📊 **Compression Statistics** - Real-time compression ratio and space savings
- 🔢 **Huffman Codes Table** - Visualize generated variable-length binary codes
- 📈 **Frequency Analysis** - Detailed character frequency distribution
- 💾 **File Management** - Download compressed (.huff) and decompressed files

### User Experience
- 🎨 **Modern Dark Theme** - Professional dark UI with neon cyan accents
- 💎 **Glassmorphism Design** - Frosted glass effects with backdrop blur
- ⚡ **Smooth Animations** - Floating particles, hover effects, and transitions
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎯 **Drag & Drop** - Intuitive file upload with visual feedback
- 🔔 **Toast Notifications** - User-friendly success/error messages

## 🚀 Live Demo

**Try it now:** [https://badr0507.github.io/Huffman-Encoder-and-Decoder/](https://badr0507.github.io/Huffman-Encoder-and-Decoder/)

## 📁 Project Structure

```
Huffman-Encoder-and-Decoder/
├── index.html          # Main HTML structure
├── styles.css          # Dark theme styling
├── huffman.js          # Algorithm implementation
└── README.md           # Documentation
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Glassmorphism, animations
- **JavaScript (ES6+)** - Modern syntax
- **Huffman Coding** - Lossless compression algorithm

## 📖 How to Use

### Encoding (Compress):
1. Click **"Encode (Compress)"** tab
2. Upload a `.txt` file
3. Click **"Compress File"**
4. View statistics and download `.huff` file

### Decoding (Decompress):
1. Click **"Decode (Decompress)"** tab
2. Upload a `.huff` file
3. Click **"Decompress File"**
4. Download restored original file

## 🧪 Algorithm Details

### Implementation Highlights

- **Frequency Analysis:** [View Code](https://github.com/Badr0507/Huffman-Encoder-and-Decoder/blob/main/huffman.js#L47-L54)
- **Tree Construction:** [View Code](https://github.com/Badr0507/Huffman-Encoder-and-Decoder/blob/main/huffman.js#L56-L79)
- **Code Generation:** [View Code](https://github.com/Badr0507/Huffman-Encoder-and-Decoder/blob/main/huffman.js#L81-L93)
- **Encoding/Decoding:** [View Code](https://github.com/Badr0507/Huffman-Encoder-and-Decoder/blob/main/huffman.js#L95-L117)

## 📊 Performance

- **Typical Compression:** 40-50% for English text
- **Lossless:** Perfect reconstruction guaranteed
- **Time Complexity:** O(n log k) where n = text length, k = unique characters

## 🔧 Installation

```bash
git clone https://github.com/Badr0507/Huffman-Encoder-and-Decoder.git
cd Huffman-Encoder-and-Decoder
# Open index.html in browser
```

No dependencies required!

## 👨‍💻 Author

**Badr Dyane**  
Student ID: F23040113

## 📄 License

Educational project for academic purposes.

---

⭐ **Star this repo if you find it useful!**
