# Canvas LMS MCP Server

A Model Context Protocol server for Canvas LMS integration with FERPA-compliant student data protection, built with Node.js and TypeScript.

## 🚀 Features

### Self-Contained Distribution
- **Node.js-based** - no system Python modifications required
- **All dependencies bundled** - works in corporate environments
- **TypeScript implementation** for better reliability and maintainability
- **Zero security policy conflicts** - no --break-system-packages flags

### Canvas Integration
- **9 essential tools** covering courses, assignments, discussions, and analytics
- **Natural language interface** for complex Canvas operations
- **Real-time data access** with proper error handling and retries

### Privacy & Security
- **FERPA-compliant data anonymization** automatically protects student privacy
- **Secure credential handling** with validation and error checking
- **Local-only processing** ensures sensitive data never leaves your machine

## 📚 Available Tools

### Course Management
- `list_courses` - List all accessible courses
- `get_course_details` - Get detailed course information
- `get_course_content_overview` - Get course content overview

### Assignment Tools
- `list_assignments` - List assignments for a course
- `get_assignment_details` - Get detailed assignment information

### Discussion Tools
- `list_discussion_topics` - List discussion topics

### User Management
- `list_users` - List course users with role filtering

### Analytics
- `get_student_analytics` - Get student activity and progress data

### Privacy Tools
- `get_anonymization_status` - Check FERPA anonymization status

## 🛠️ Installation

### Via DXT Extension (Recommended)

1. Download the `.dxt` file from releases
2. Install in Claude Desktop via Extensions menu
3. Configure your Canvas API credentials

### Manual Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Configure environment variables (see `.env.example`)

## ⚙️ Configuration

Set the following environment variables:

```bash
CANVAS_API_URL=https://your-institution.instructure.com
CANVAS_API_TOKEN=your_canvas_api_token_here
FERPA_COMPLIANCE=true
```

## 🔒 FERPA Compliance

This server automatically anonymizes student data when `FERPA_COMPLIANCE=true`:

- Student names → Anonymous IDs
- Email addresses → Anonymous addresses
- Sensitive profile information → `[ANONYMIZED]`

## 🚀 Development

```bash
npm install
npm run build
npm run dev
```

## 📄 License

MIT License - see LICENSE file for details.