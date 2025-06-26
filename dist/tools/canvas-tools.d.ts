import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { CanvasClient } from '../canvas-client.js';
import { StudentDataAnonymizer } from '../anonymizer.js';
export declare class CanvasTools {
    private client;
    private anonymizer;
    constructor(client: CanvasClient, anonymizer: StudentDataAnonymizer);
    getAllTools(): Tool[];
    callTool(name: string, args: Record<string, any>): Promise<CallToolResult>;
    private listCourses;
    private getCourseDetails;
    private getCourseContentOverview;
    private listAssignments;
    private getAssignmentDetails;
    private listDiscussionTopics;
    private listUsers;
    private getStudentAnalytics;
    private getAnonymizationStatus;
}
//# sourceMappingURL=canvas-tools.d.ts.map