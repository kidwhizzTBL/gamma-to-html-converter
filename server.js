// Gamma Website to HTML Converter - Production Version
// Created by Aamir Khan (aamir@aamir.uk.com)
// Optimized for gamma.site exports

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

let puppeteer;
try {
    puppeteer = require('puppeteer-core');
    console.log('✓ Puppeteer loaded successfully');
} catch (err) {
    console.error('✗ Puppeteer not found. Install with: npm install puppeteer-core');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Find Chrome
function findChrome() {
    const possiblePaths = [
        process.env.PUPPETEER_EXECUTABLE_PATH,
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];

    for (const chromePath of possiblePaths.filter(Boolean)) {
        if (fs.existsSync(chromePath)) {
            console.log('✓ Found Chrome at:', chromePath);
            return chromePath;
        }
    }
    return null;
}

const CHROME_PATH = findChrome();
if (!CHROME_PATH) {
    console.error('ERROR: Chrome not found!');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'gamma-converter.html'));
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'Gamma Website to HTML Converter',
        mode: 'production',
        author: 'Aamir Khan',
        contact: 'aamir@aamir.uk.com',
        chromePath: CHROME_PATH,
        timestamp: new Date().toISOString()
    });
});

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract from gamma.site - Production version based on working debug script
async function extractGammaSite(url) {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  Gamma Website to HTML Converter              ║');
    console.log('║  Created by Aamir Khan                         ║');
    console.log('║  Email: aamir@aamir.uk.com                     ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    console.log('[1/6] Launching browser...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('[2/6] Loading Gamma website...');
        console.log('URL:', url);
        
        await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 90000 
        });

        console.log('[3/6] Waiting for initial content...');
        await wait(3000);

        console.log('[4/6] Auto-scrolling to load all lazy content...');
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 500;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        window.scrollTo(0, 0);
                        resolve();
                    }
                }, 100);
            });
        });
        console.log('  ✓ Scroll complete');
        
        await wait(3000); // Wait for lazy content to fully load

        console.log('[5/6] Extracting content and assets...');
        
        // Take screenshot for reference
        await page.screenshot({ path: 'gamma-conversion-screenshot.png', fullPage: true });
        console.log('  ✓ Screenshot saved: gamma-conversion-screenshot.png');
        
        // Extract everything
        const extractedData = await page.evaluate(() => {
            // Get metadata
            const metadata = {
                title: document.title || 'Gamma Presentation',
                url: window.location.href,
                description: document.querySelector('meta[name="description"]')?.content || '',
                convertedBy: 'Aamir Khan (aamir@aamir.uk.com)',
                convertedDate: new Date().toISOString()
            };

            // Get all stylesheets
            const styles = Array.from(document.styleSheets)
                .map(sheet => {
                    try {
                        return Array.from(sheet.cssRules || [])
                            .map(rule => rule.cssText)
                            .join('\n');
                    } catch (e) {
                        return '';
                    }
                })
                .join('\n');

            // Get inline styles
            const inlineStyles = Array.from(document.querySelectorAll('style'))
                .map(style => style.textContent)
                .join('\n');

            // Count sections
            const sections = document.querySelectorAll('section, article, [class*="card"], [class*="slide"], [class*="page"]');

            // Find all images
            const images = Array.from(document.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt || '',
                width: img.width,
                height: img.height
            }));

            // Get full HTML content
            const fullHTML = document.documentElement.outerHTML;
            const bodyHTML = document.body.innerHTML;
            const headHTML = document.head.innerHTML;

            return {
                metadata,
                styles,
                inlineStyles,
                fullHTML,
                bodyHTML,
                headHTML,
                images,
                sectionCount: sections.length
            };
        });

        console.log(`  ✓ Found ${extractedData.sectionCount} sections`);
        console.log(`  ✓ Found ${extractedData.images.length} images`);

        console.log('[6/6] Converting images to Base64...');
        
        // Convert images to Base64
        const imageMap = new Map();
        let convertedCount = 0;
        
        for (const img of extractedData.images) {
            if (img.src && img.src.startsWith('http') && !imageMap.has(img.src)) {
                try {
                    const imgPage = await browser.newPage();
                    const response = await imgPage.goto(img.src, { 
                        waitUntil: 'networkidle0',
                        timeout: 10000 
                    });
                    
                    if (response && response.ok()) {
                        const buffer = await response.buffer();
                        const base64 = buffer.toString('base64');
                        const contentType = response.headers()['content-type'] || 'image/png';
                        imageMap.set(img.src, `data:${contentType};base64,${base64}`);
                        convertedCount++;
                        if (convertedCount % 5 === 0) {
                            console.log(`  ✓ Converted ${convertedCount}/${extractedData.images.length} images...`);
                        }
                    }
                    await imgPage.close();
                } catch (err) {
                    console.log(`  ✗ Failed to convert: ${img.src.substring(0, 50)}...`);
                }
            }
        }

        // Replace image URLs in HTML
        let finalBodyHTML = extractedData.bodyHTML;
        let finalFullHTML = extractedData.fullHTML;
        
        imageMap.forEach((base64, url) => {
            const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedUrl, 'g');
            finalBodyHTML = finalBodyHTML.replace(regex, base64);
            finalFullHTML = finalFullHTML.replace(regex, base64);
        });

        console.log('\n✓ Extraction complete!');
        console.log(`  Title: ${extractedData.metadata.title}`);
        console.log(`  Sections: ${extractedData.sectionCount}`);
        console.log(`  Images: ${imageMap.size} converted`);
        console.log(`  HTML Size: ${(finalFullHTML.length / 1024 / 1024).toFixed(2)} MB\n`);

        return {
            metadata: extractedData.metadata,
            styles: extractedData.styles,
            inlineStyles: extractedData.inlineStyles,
            fullHTML: finalFullHTML,
            bodyHTML: finalBodyHTML,
            headHTML: extractedData.headHTML,
            imageCount: imageMap.size,
            sectionCount: extractedData.sectionCount
        };

    } finally {
        await browser.close();
    }
}

// Generate single-page HTML with branding
function generateHTML(data, options = {}) {
    const { metadata, styles, inlineStyles, bodyHTML } = data;
    
    const brandingComment = `
<!--
    ╔════════════════════════════════════════════════════════════╗
    ║  Gamma to HTML Converter                                   ║
    ║  Created by: Aamir Khan                                    ║
    ║  Email: aamir@aamir.uk.com                                 ║
    ║  Converted: ${metadata.convertedDate}                      ║
    ║  Source: ${metadata.url}                                   ║
    ╚════════════════════════════════════════════════════════════╝
-->`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="Gamma to HTML Converter by Aamir Khan">
    <meta name="author" content="Aamir Khan (aamir@aamir.uk.com)">
    <meta name="converted-by" content="Aamir Khan">
    <meta name="contact" content="aamir@aamir.uk.com">
    <meta name="source" content="${metadata.url}">
    <meta name="converted-date" content="${metadata.convertedDate}">
    <title>${metadata.title}</title>
    ${metadata.description ? `<meta name="description" content="${metadata.description}">` : ''}
    ${brandingComment}
    
    <!-- Extracted Gamma Styles -->
    <style>
        /* Original Gamma Styles */
        ${styles}
        
        /* Inline Styles from Gamma */
        ${inlineStyles}
        
        /* Base fixes for display */
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100%;
            overflow-x: hidden;
        }
        
        /* Responsive images */
        img {
            max-width: 100%;
            height: auto;
        }
        
        /* Print styles */
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .no-print {
                display: none !important;
            }
        }
        
        /* Branding watermark (subtle) */
        body::after {
            content: 'Converted by Aamir Khan | aamir@aamir.uk.com';
            position: fixed;
            bottom: 5px;
            right: 10px;
            font-size: 9px;
            color: rgba(0, 0, 0, 0.2);
            pointer-events: none;
            z-index: 9999;
        }
    </style>
</head>
<body>
    ${bodyHTML}
    
    ${brandingComment}
    
    <!-- Smooth scrolling for anchor links -->
    <script>
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Log conversion info
        console.log('%c╔════════════════════════════════════════════════════════════╗', 'color: #667eea');
        console.log('%c║  Gamma to HTML Converter                                   ║', 'color: #667eea');
        console.log('%c║  Created by: Aamir Khan                                    ║', 'color: #667eea');
        console.log('%c║  Email: aamir@aamir.uk.com                                 ║', 'color: #667eea');
        console.log('%c║  Converted: ${metadata.convertedDate}                      ║', 'color: #667eea');
        console.log('%c╚════════════════════════════════════════════════════════════╝', 'color: #667eea');
    </script>
</body>
</html>`;
}

// Convert endpoint
app.post('/api/convert', async (req, res) => {
    try {
        const { url, options = {} } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate gamma.site URL
        const gammaSitePattern = /^https:\/\/[a-zA-Z0-9-]+\.gamma\.site\/?/;
        const gammaAppPattern = /^https:\/\/gamma\.app\/(docs|public|embed)\/[a-zA-Z0-9-]+/;
        
        if (!gammaSitePattern.test(url) && !gammaAppPattern.test(url)) {
            return res.status(400).json({ 
                error: 'Please use a Gamma website export URL (*.gamma.site)',
                example: 'https://your-presentation.gamma.site/'
            });
        }

        const extractedData = await extractGammaSite(url);
        const html = generateHTML(extractedData, options);

        res.json({
            success: true,
            html: html,
            metadata: extractedData.metadata,
            stats: {
                sections: extractedData.sectionCount,
                images: extractedData.imageCount,
                fileSize: Buffer.byteLength(html, 'utf8')
            }
        });

    } catch (error) {
        console.error('\n✗ Conversion error:', error.message);
        console.error(error.stack);
        
        res.status(500).json({
            error: 'Conversion failed',
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║  🌐 Gamma Website to HTML Converter            ║
║                                                ║
║  Created by: Aamir Khan                        ║
║  Email: aamir@aamir.uk.com                     ║
║                                                ║
║  Status: ✓ Running (Production)                ║
║  Port: ${PORT}                                  ║
║  Mode: gamma.site exports                      ║
║                                                ║
║  Open: http://localhost:${PORT}                ║
╚════════════════════════════════════════════════╝

Ready to convert Gamma presentations! 🚀
    `);
});

module.exports = app;
