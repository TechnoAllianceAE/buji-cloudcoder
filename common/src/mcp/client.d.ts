import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { MCPConfig } from '../types/mcp';
import type { ToolResultOutput } from '../types/messages/content-part';
export declare function getMCPClient(config: MCPConfig): Promise<string>;
export declare function listMCPTools(clientId: string, ...args: Parameters<typeof Client.prototype.listTools>): ReturnType<typeof Client.prototype.listTools>;
export declare function callMCPTool(clientId: string, ...args: Parameters<typeof Client.prototype.callTool>): Promise<ToolResultOutput[]>;
//# sourceMappingURL=client.d.ts.map