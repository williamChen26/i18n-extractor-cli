# Project React I18n Extractor

## Overview

The I18n Extractor is a Node.js command-line tool designed to assist in the internationalization (i18n) process of your project. It scans through your project's source code, extracts untranslated text, and generates a JSON file containing all these texts. This tool helps developers easily identify and handle texts that need translation, ensuring comprehensive i18n coverage

## Features

- **Automatic Extraction: Scans JavaScript/JSX and TypeScript/TSX files to identify untranslated texts.**
- **Configurable: Allows customization of directories and functions to ignore.**
- **Supports JSX and TypeScript: Handles various syntax types including JSX and TypeScript.**
- **Output to JSON: Generates a JSON file containing all untranslated texts for easy management.**

## Installation

Before using the I18n Extractor, ensure you have Node.js installed. Then, install the required dependencies:

### yarn
```bash
yarn add --dev i18n-extract
```

### npm
```bash
npm install –save-dev i18n-extract
```

## Usage
To use the I18n Extractor, you can run it directly from the command line. Below are the available command-line options:

### Command-Line Options

| Option      | Alias | Description | Default |
| ----------- | ----- | ----------- | ------- |
| `--file <path>`| `-f`|Specify the file path to scan|`src`|
| `--function <functionName>`| `-g`|Specify one or more function names that indicate text is already translated|`['t', 'i18n', 'translate']`|

To run the extractor with custom options:
```bash
i18n-extract untsl --file <file-path> -g <function-name> -g <another-function-name>
```
Replace `<file-path>` with your desired source directory path and `<function-name>` with the name of the function indicating translated text. You can use -g multiple times to input multiple function names.


## Output

The extracted untranslated texts are saved in a JSON file located at locales/text.json by default. The structure of the JSON file maps file paths to their respective untranslated texts:

```json
{
  "path/to/file.js": {
    "Hello, World!": "Hello, World!",
    "Click me": "Click me"
  }
}
```
