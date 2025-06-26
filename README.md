# Canvas LMS MCP Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) extension that brings powerful Canvas LMS integration to Claude Desktop with built-in FERPA-compliant student data protection. Built with Node.js and TypeScript for reliability and maintainability.

> **Note**: This extension requires [Claude Desktop](https://www.anthropic.com/desktop) with MCP support.

## 🌟 Why Use This Extension?

- **Seamless Canvas Integration**: Access your LMS data directly within Claude
- **Education-First Security**: Built with FERPA compliance and student privacy at its core
- **Developer Friendly**: TypeScript-based with comprehensive documentation
- **Self-Contained**: No system dependencies or complex setup required

## 🚀 Features

### For Claude Desktop Users
- **Natural Language Interface**: Interact with Canvas using everyday language
- **Context-Aware**: Claude understands your course context and provides relevant suggestions
- **Quick Access**: No need to switch between browser tabs or applications

### For Educators & Administrators
- **Course Management**: View and manage your courses with simple commands
- **Assignment Insights**: Get detailed information about assignments and submissions
- **Student Analytics**: Access anonymized student performance data
- **Discussion Monitoring**: Keep track of course discussions and participation

### For Developers
- **TypeScript-Powered**: Full type safety and modern JavaScript features
- **Extensible Architecture**: Easy to add new tools and functionality
- **Comprehensive Testing**: Built with reliability in mind
- **Modern Tooling**: Uses the latest Node.js and npm features

## 📚 Available Tools

### Course Management

#### `list_courses`
List all courses for the authenticated user.

**Parameters:**
- `include_concluded` (boolean, optional) - Include concluded courses (default: false)
- `include_all` (boolean, optional) - Include all courses regardless of enrollment (default: false)

#### `get_course_details`
Get detailed information about a specific course.

**Parameters:**
- `course_identifier` (string, required) - The Canvas course code or ID

#### `get_course_content_overview`
Get a comprehensive overview of course content including pages and modules.

**Parameters:**
- `course_identifier` (string, required) - The Canvas course code or ID

### Assignment Tools

#### `list_assignments`
List assignments for a specific course.

**Parameters:**
- `course_identifier` (string, required) - The Canvas course code or ID
- `include_submissions` (boolean, optional) - Include submission data (default: false)

#### `get_assignment_details`
Get detailed information about a specific assignment.

**Parameters:**
- `course_identifier` (string, required) - The Canvas course code or ID
- `assignment_id` (string, required) - The assignment ID

### Discussion Tools

#### `list_discussion_topics`
List discussion topics for a specific course.

**Parameters:**
- `course_identifier` (string, required) - The Canvas course code or ID

### User Management

#### `list_users`
List users enrolled in a specific course.

**Parameters:**
- `course_identifier` (string, required) - The Canvas course code or ID
- `enrollment_type` (string, optional) - Filter by enrollment type: `student`, `teacher`, `ta`, `observer`, `designer`

### Analytics

#### `get_student_analytics`
Get detailed analytics about student activity and progress.

**Parameters:**
- `course_identifier` (string, required) - The Canvas course code or ID
- `student_id` (string, optional) - Specific student ID for individual analytics

### Privacy Tools

#### `get_anonymization_status`
Check the current status of student data anonymization.

**Parameters:** None required

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or later
- [Claude Desktop](https://www.anthropic.com/desktop) with MCP support
- Canvas API access token (from your Canvas instance)

### Installation

#### Option 1: Install from Release (Recommended)

1. Download the latest `.dxt` file from [Releases](https://github.com/vishalsachdev/canvas-lms-mcp-extension/releases)
2. In Claude Desktop, go to `Settings > Extensions`
3. Click "Install Extension" and select the downloaded `.dxt` file

#### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/vishalsachdev/canvas-lms-mcp-extension.git
cd canvas-lms-mcp-extension

# Install dependencies
npm install

# Build the extension
npm run build

# The extension will be available in the `dist` directory
```

### Configuration

1. **Get your Canvas API token**:
   - Log in to your Canvas instance
   - Go to `Account > Settings > Approved Integrations`
   - Click "New Access Token" and follow the prompts

2. **Configure the extension**:
   - Open Claude Desktop settings
   - Navigate to the Extensions tab
   - Find "Canvas LMS MCP Extension" in the list
   - Enter your Canvas instance URL and API token
   - Toggle FERPA compliance based on your needs

   Alternatively, you can configure using environment variables:
   ```bash
   CANVAS_API_URL=https://your-institution.instructure.com
   CANVAS_API_TOKEN=your_api_token_here
   FERPA_COMPLIANCE=true
   ```

## ⚙️ Configuration

Set the following environment variables:

```bash
CANVAS_API_URL=https://your-institution.instructure.com
CANVAS_API_TOKEN=your_canvas_api_token_here
FERPA_COMPLIANCE=true
```

## 🔒 Privacy & Security

### FERPA Compliance

This extension is designed with student privacy as a top priority. When `FERPA_COMPLIANCE` is enabled (default):

- **Student Names**: Replaced with anonymous IDs (e.g., "Student_12345")
- **Email Addresses**: Anonymized to prevent identification
- **Sensitive Data**: Automatically redacted or masked
- **Local Processing**: All data processing happens on your machine

### Data Handling

- **No Data Storage**: The extension doesn't store any Canvas data locally beyond the current session
- **Secure Credentials**: Your API token is stored securely using Claude Desktop's credential management
- **Transparent Operations**: All API calls are logged (in debug mode) for transparency

## 🛠️ Development

### Getting Started

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

### Project Structure

```
src/
  ├── anonymizer.ts    # FERPA-compliant data anonymization
  ├── canvas-client.ts  # Canvas API client
  ├── config.ts        # Configuration management
  ├── server.ts        # MCP server implementation
  └── tools/           # Canvas operation implementations
      └── canvas-tools.ts
```

### Testing

Run the test suite:

```bash
npm test
```

### Building for Production

```bash
# Build the extension
npm run build

# Package for distribution (creates .dxt file)
npm run package
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for educators and students
- Inspired by the Model Context Protocol specification
- Made possible by the Canvas LMS API

---

<p align="center">
  <a href="https://github.com/vishalsachdev/canvas-lms-mcp-extension">GitHub</a> • 
  <a href="https://www.anthropic.com/desktop">Claude Desktop</a> • 
  <a href="https://www.instructure.com/canvas">Canvas LMS</a>
</p>