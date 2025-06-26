import { Tool, CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js';
import { CanvasClient } from '../canvas-client.js';
import { StudentDataAnonymizer } from '../anonymizer.js';

export class CanvasTools {
  constructor(
    private client: CanvasClient,
    private anonymizer: StudentDataAnonymizer
  ) {}

  getAllTools(): Tool[] {
    return [
      // Course Tools
      {
        name: 'list_courses',
        description: 'List all courses for the authenticated user',
        inputSchema: {
          type: 'object',
          properties: {
            include_concluded: {
              type: 'boolean',
              description: 'Include concluded courses',
              default: false,
            },
            include_all: {
              type: 'boolean',
              description: 'Include all courses regardless of enrollment',
              default: false,
            },
          },
        },
      },
      {
        name: 'get_course_details',
        description: 'Get detailed information about a specific course',
        inputSchema: {
          type: 'object',
          properties: {
            course_identifier: {
              type: 'string',
              description: 'The Canvas course code or ID',
            },
          },
          required: ['course_identifier'],
        },
      },
      {
        name: 'get_course_content_overview',
        description: 'Get a comprehensive overview of course content including pages and modules',
        inputSchema: {
          type: 'object',
          properties: {
            course_identifier: {
              type: 'string',
              description: 'The Canvas course code or ID',
            },
          },
          required: ['course_identifier'],
        },
      },
      // Assignment Tools
      {
        name: 'list_assignments',
        description: 'List assignments for a specific course',
        inputSchema: {
          type: 'object',
          properties: {
            course_identifier: {
              type: 'string',
              description: 'The Canvas course code or ID',
            },
            include_submissions: {
              type: 'boolean',
              description: 'Include submission data',
              default: false,
            },
          },
          required: ['course_identifier'],
        },
      },
      {
        name: 'get_assignment_details',
        description: 'Get detailed information about a specific assignment',
        inputSchema: {
          type: 'object',
          properties: {
            course_identifier: {
              type: 'string',
              description: 'The Canvas course code or ID',
            },
            assignment_id: {
              type: 'string',
              description: 'The assignment ID',
            },
          },
          required: ['course_identifier', 'assignment_id'],
        },
      },
      // Discussion Tools
      {
        name: 'list_discussion_topics',
        description: 'List discussion topics for a specific course',
        inputSchema: {
          type: 'object',
          properties: {
            course_identifier: {
              type: 'string',
              description: 'The Canvas course code or ID',
            },
          },
          required: ['course_identifier'],
        },
      },
      // User Tools
      {
        name: 'list_users',
        description: 'List users enrolled in a specific course',
        inputSchema: {
          type: 'object',
          properties: {
            course_identifier: {
              type: 'string',
              description: 'The Canvas course code or ID',
            },
            enrollment_type: {
              type: 'string',
              description: 'Filter by enrollment type',
              enum: ['student', 'teacher', 'ta', 'observer', 'designer'],
            },
          },
          required: ['course_identifier'],
        },
      },
      // Analytics Tools
      {
        name: 'get_student_analytics',
        description: 'Get detailed analytics about student activity and progress',
        inputSchema: {
          type: 'object',
          properties: {
            course_identifier: {
              type: 'string',
              description: 'The Canvas course code or ID',
            },
            student_id: {
              type: 'string',
              description: 'Specific student ID (optional)',
            },
          },
          required: ['course_identifier'],
        },
      },
      // FERPA Tools
      {
        name: 'get_anonymization_status',
        description: 'Check the current status of student data anonymization',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  async callTool(name: string, args: Record<string, any>): Promise<CallToolResult> {
    try {
      switch (name) {
        case 'list_courses':
          return await this.listCourses(args);
        case 'get_course_details':
          return await this.getCourseDetails(args);
        case 'get_course_content_overview':
          return await this.getCourseContentOverview(args);
        case 'list_assignments':
          return await this.listAssignments(args);
        case 'get_assignment_details':
          return await this.getAssignmentDetails(args);
        case 'list_discussion_topics':
          return await this.listDiscussionTopics(args);
        case 'list_users':
          return await this.listUsers(args);
        case 'get_student_analytics':
          return await this.getStudentAnalytics(args);
        case 'get_anonymization_status':
          return await this.getAnonymizationStatus(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
          } as TextContent,
        ],
        isError: true,
      };
    }
  }

  private async listCourses(args: Record<string, any>): Promise<CallToolResult> {
    const params: Record<string, any> = {
      enrollment_state: 'active',
    };

    if (args.include_concluded) {
      params.enrollment_state = 'current_and_concluded';
    }

    if (args.include_all) {
      params.include = ['total_students', 'term', 'course_progress'];
    }

    const response = await this.client.get('/courses', params);
    const anonymizedData = this.anonymizer.anonymizeData(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(anonymizedData, null, 2),
        } as TextContent,
      ],
    };
  }

  private async getCourseDetails(args: Record<string, any>): Promise<CallToolResult> {
    const courseId = args.course_identifier;
    const params = {
      include: ['term', 'course_progress', 'sections', 'total_students'],
    };

    const response = await this.client.get(`/courses/${courseId}`, params);
    const anonymizedData = this.anonymizer.anonymizeData(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(anonymizedData, null, 2),
        } as TextContent,
      ],
    };
  }

  private async getCourseContentOverview(args: Record<string, any>): Promise<CallToolResult> {
    const courseId = args.course_identifier;

    // Get modules and pages in parallel
    const [modulesResponse, pagesResponse] = await Promise.all([
      this.client.get(`/courses/${courseId}/modules`, { include: ['items'] }),
      this.client.get(`/courses/${courseId}/pages`),
    ]);

    const overview = {
      modules: modulesResponse.data,
      pages: pagesResponse.data,
      summary: {
        total_modules: modulesResponse.data.length,
        total_pages: pagesResponse.data.length,
      },
    };

    const anonymizedData = this.anonymizer.anonymizeData(overview);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(anonymizedData, null, 2),
        } as TextContent,
      ],
    };
  }

  private async listAssignments(args: Record<string, any>): Promise<CallToolResult> {
    const courseId = args.course_identifier;
    const params: Record<string, any> = {};

    if (args.include_submissions) {
      params.include = ['submission'];
    }

    const response = await this.client.get(`/courses/${courseId}/assignments`, params);
    const anonymizedData = this.anonymizer.anonymizeData(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(anonymizedData, null, 2),
        } as TextContent,
      ],
    };
  }

  private async getAssignmentDetails(args: Record<string, any>): Promise<CallToolResult> {
    const courseId = args.course_identifier;
    const assignmentId = args.assignment_id;

    const params = {
      include: ['submission', 'rubric_assessment', 'rubric'],
    };

    const response = await this.client.get(
      `/courses/${courseId}/assignments/${assignmentId}`,
      params
    );
    const anonymizedData = this.anonymizer.anonymizeData(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(anonymizedData, null, 2),
        } as TextContent,
      ],
    };
  }

  private async listDiscussionTopics(args: Record<string, any>): Promise<CallToolResult> {
    const courseId = args.course_identifier;

    const response = await this.client.get(`/courses/${courseId}/discussion_topics`);
    const anonymizedData = this.anonymizer.anonymizeData(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(anonymizedData, null, 2),
        } as TextContent,
      ],
    };
  }

  private async listUsers(args: Record<string, any>): Promise<CallToolResult> {
    const courseId = args.course_identifier;
    const params: Record<string, any> = {};

    if (args.enrollment_type) {
      params.enrollment_type = [args.enrollment_type];
    }

    const response = await this.client.get(`/courses/${courseId}/users`, params);
    const anonymizedData = this.anonymizer.anonymizeData(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(anonymizedData, null, 2),
        } as TextContent,
      ],
    };
  }

  private async getStudentAnalytics(args: Record<string, any>): Promise<CallToolResult> {
    const courseId = args.course_identifier;
    
    try {
      let analyticsData: any = {};

      if (args.student_id) {
        // Get specific student analytics
        const [activityResponse, assignmentsResponse] = await Promise.all([
          this.client.get(`/courses/${courseId}/analytics/student_summaries`),
          this.client.get(`/courses/${courseId}/students/submissions`, {
            student_ids: [args.student_id],
            include: ['assignment'],
          }),
        ]);

        analyticsData = {
          student_activity: activityResponse.data.find((s: any) => s.id.toString() === args.student_id),
          submissions: assignmentsResponse.data,
        };
      } else {
        // Get course-wide analytics
        const [summariesResponse, participationResponse] = await Promise.all([
          this.client.get(`/courses/${courseId}/analytics/student_summaries`),
          this.client.get(`/courses/${courseId}/analytics/activity`),
        ]);

        analyticsData = {
          student_summaries: summariesResponse.data,
          course_activity: participationResponse.data,
          summary: {
            total_students: summariesResponse.data.length,
            avg_score: summariesResponse.data.length > 0 
              ? summariesResponse.data.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / summariesResponse.data.length
              : 0,
          },
        };
      }

      const anonymizedData = this.anonymizer.anonymizeData(analyticsData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(anonymizedData, null, 2),
          } as TextContent,
        ],
      };
    } catch (error) {
      // Analytics endpoints might not be available for all users
      return {
        content: [
          {
            type: 'text',
            text: 'Analytics data is not available. This may be due to insufficient permissions or the analytics feature not being enabled for this course.',
          } as TextContent,
        ],
      };
    }
  }

  private async getAnonymizationStatus(args: Record<string, any>): Promise<CallToolResult> {
    const status = this.anonymizer.getAnonymizationStatus();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        } as TextContent,
      ],
    };
  }
}