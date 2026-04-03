package tools

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/utils"
)

// NotebookEditTool edits Jupyter notebook cells
type NotebookEditTool struct{}

func NewNotebookEditTool() *NotebookEditTool { return &NotebookEditTool{} }

func (t *NotebookEditTool) Name() string { return "NotebookEdit" }

func (t *NotebookEditTool) Description() string {
	return `Edits cells in Jupyter notebooks (.ipynb files).

Operations:
- "insert": Insert a new cell at the given index
- "replace": Replace the source of a cell at the given index
- "delete": Delete the cell at the given index`
}

func (t *NotebookEditTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"file_path": map[string]any{
				"type":        "string",
				"description": "Absolute path to the .ipynb file",
			},
			"operation": map[string]any{
				"type":        "string",
				"enum":        []string{"insert", "replace", "delete"},
				"description": "The operation to perform",
			},
			"cell_index": map[string]any{
				"type":        "integer",
				"description": "The cell index to operate on (0-based)",
			},
			"cell_type": map[string]any{
				"type":        "string",
				"enum":        []string{"code", "markdown"},
				"description": "Cell type (for insert/replace)",
			},
			"source": map[string]any{
				"type":        "string",
				"description": "Cell content (for insert/replace)",
			},
		},
		"required": []string{"file_path", "operation", "cell_index"},
	}
}

func (t *NotebookEditTool) IsReadOnly(_ map[string]any) bool { return false }

// Notebook represents an ipynb file structure
type Notebook struct {
	Cells         []NotebookCell `json:"cells"`
	Metadata      map[string]any `json:"metadata"`
	NBFormat      int            `json:"nbformat"`
	NBFormatMinor int            `json:"nbformat_minor"`
}

// NotebookCell represents a single cell
type NotebookCell struct {
	CellType       string         `json:"cell_type"`
	Source          []string       `json:"source"`
	Metadata       map[string]any `json:"metadata"`
	Outputs        []any          `json:"outputs,omitempty"`
	ExecutionCount *int           `json:"execution_count,omitempty"`
}

func (t *NotebookEditTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	filePath, _ := input["file_path"].(string)
	operation, _ := input["operation"].(string)
	cellIndex := int(0)
	if v, ok := input["cell_index"].(float64); ok {
		cellIndex = int(v)
	}
	cellType, _ := input["cell_type"].(string)
	source, _ := input["source"].(string)

	if filePath == "" {
		return types.ToolResult{Content: "Error: file_path is required", IsError: true}
	}
	filePath = utils.AbsPath(filePath)

	// Read notebook
	data, err := os.ReadFile(filePath)
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error reading notebook: %v", err), IsError: true}
	}

	var nb Notebook
	if err := json.Unmarshal(data, &nb); err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error parsing notebook: %v", err), IsError: true}
	}

	switch operation {
	case "insert":
		if cellType == "" {
			cellType = "code"
		}
		newCell := NotebookCell{
			CellType: cellType,
			Source:   splitSource(source),
			Metadata: map[string]any{},
		}
		if cellType == "code" {
			newCell.Outputs = []any{}
			zero := 0
			newCell.ExecutionCount = &zero
		}

		if cellIndex > len(nb.Cells) {
			cellIndex = len(nb.Cells)
		}
		nb.Cells = append(nb.Cells[:cellIndex], append([]NotebookCell{newCell}, nb.Cells[cellIndex:]...)...)

	case "replace":
		if cellIndex >= len(nb.Cells) {
			return types.ToolResult{Content: fmt.Sprintf("Error: cell_index %d out of range (notebook has %d cells)", cellIndex, len(nb.Cells)), IsError: true}
		}
		nb.Cells[cellIndex].Source = splitSource(source)
		if cellType != "" {
			nb.Cells[cellIndex].CellType = cellType
		}
		// Clear outputs on replace
		nb.Cells[cellIndex].Outputs = []any{}

	case "delete":
		if cellIndex >= len(nb.Cells) {
			return types.ToolResult{Content: fmt.Sprintf("Error: cell_index %d out of range (notebook has %d cells)", cellIndex, len(nb.Cells)), IsError: true}
		}
		nb.Cells = append(nb.Cells[:cellIndex], nb.Cells[cellIndex+1:]...)

	default:
		return types.ToolResult{Content: fmt.Sprintf("Error: unknown operation: %s", operation), IsError: true}
	}

	// Write back
	output, err := json.MarshalIndent(nb, "", " ")
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error serializing notebook: %v", err), IsError: true}
	}

	if err := os.WriteFile(filePath, output, 0644); err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error writing notebook: %v", err), IsError: true}
	}

	return types.ToolResult{Content: fmt.Sprintf("Successfully %sed cell at index %d in %s (%d cells total)", operation, cellIndex, filePath, len(nb.Cells))}
}

// splitSource splits source into lines for ipynb format (each line ends with \n except possibly last)
func splitSource(s string) []string {
	if s == "" {
		return []string{}
	}
	var lines []string
	current := ""
	for _, ch := range s {
		current += string(ch)
		if ch == '\n' {
			lines = append(lines, current)
			current = ""
		}
	}
	if current != "" {
		lines = append(lines, current)
	}
	return lines
}
