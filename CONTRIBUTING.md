# Contributing to Gamma to HTML Converter

First off, thank you for considering contributing to this project! 🎉

## Code of Conduct

Be respectful, constructive, and professional.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the problem
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details**: OS, Node.js version, Chrome version

**Example:**
```
Title: Images not converting on macOS Big Sur

Description:
When converting a Gamma presentation with images, the output HTML has no images.

Steps to Reproduce:
1. Start server with `npm start`
2. Enter URL: https://example.gamma.site/
3. Click "Convert to HTML"
4. Download shows 0 images converted

Expected: All images should be embedded
Actual: No images in output

Environment:
- macOS Big Sur 11.6
- Node.js v18.12.0
- Chrome 108.0.5359.124
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Include:

- **Use case**: Why is this needed?
- **Expected behavior**: What should it do?
- **Examples**: Show how it would work

### Pull Requests

1. **Fork** the repo
2. **Create a branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Write clean, commented code
4. **Test**: Ensure everything works
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

#### Pull Request Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation if needed
- Test on your local environment
- Reference any related issues

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/gamma-to-html-converter.git
cd gamma-to-html-converter

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Chrome path
# Then start server
npm start
```

## Project Structure

```
gamma-to-html-converter/
├── server.js                 # Main backend logic
├── gamma-converter.html      # Frontend interface
├── package.json              # Dependencies & scripts
└── docs/                     # Documentation
```

## Coding Standards

- Use meaningful variable names
- Comment complex logic
- Keep functions focused and small
- Handle errors gracefully
- Log useful information

## Testing

Before submitting, test:

1. **Basic conversion**: Test with a public Gamma URL
2. **Large presentations**: 50+ sections
3. **Image-heavy presentations**: 20+ images
4. **Error cases**: Invalid URLs, network errors

## Questions?

Feel free to open an issue or email [aamir@aamir.uk.com](mailto:aamir@aamir.uk.com)

Thank you! 🙏
