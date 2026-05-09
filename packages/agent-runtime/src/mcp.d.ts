import type { AgentTemplate } from './templates/types';
import type { RequestMcpToolDataFn } from '@bcp/common/types/contracts/client';
import type { OptionalFields } from '@bcp/common/types/function-params';
import type { CustomToolDefinitions, ProjectFileContext } from '@bcp/common/util/file';
export declare function getMCPToolData(params: OptionalFields<{
    toolNames: AgentTemplate['toolNames'];
    mcpServers: AgentTemplate['mcpServers'];
    writeTo: ProjectFileContext['customToolDefinitions'];
    requestMcpToolData: RequestMcpToolDataFn;
}, 'writeTo'>): Promise<CustomToolDefinitions>;
//# sourceMappingURL=mcp.d.ts.map