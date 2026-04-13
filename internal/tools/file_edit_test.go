package tools

import (
	"os"
	"path/filepath"
	"testing"
)

func writeTestFile(t *testing.T, dir, name, content string) string {
	t.Helper()
	path := filepath.Join(dir, name)
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}
	return path
}

func TestFileEdit_BasicReplace(t *testing.T) {
	dir := t.TempDir()
	path := writeTestFile(t, dir, "test.go", "func main() {\n\tfmt.Println(\"hello\")\n}\n")

	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"file_path":  path,
		"old_string": "hello",
		"new_string": "world",
	}, &ToolContext{CWD: dir})

	if result.IsError {
		t.Fatalf("unexpected error: %s", result.Content)
	}

	data, _ := os.ReadFile(path)
	if got := string(data); got != "func main() {\n\tfmt.Println(\"world\")\n}\n" {
		t.Errorf("unexpected file content:\n%s", got)
	}
}

func TestFileEdit_MultiMatchRejectsWithoutReplaceAll(t *testing.T) {
	dir := t.TempDir()
	content := "foo\nbar\nfoo\nbaz\n"
	path := writeTestFile(t, dir, "test.txt", content)

	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"file_path":  path,
		"old_string": "foo",
		"new_string": "qux",
	}, &ToolContext{CWD: dir})

	if !result.IsError {
		t.Error("expected error for multi-match without replace_all")
	}

	// File should be unchanged
	data, _ := os.ReadFile(path)
	if string(data) != content {
		t.Error("file should not have been modified")
	}
}

func TestFileEdit_ReplaceAll(t *testing.T) {
	dir := t.TempDir()
	path := writeTestFile(t, dir, "test.txt", "foo\nbar\nfoo\nbaz\n")

	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"file_path":   path,
		"old_string":  "foo",
		"new_string":  "qux",
		"replace_all": true,
	}, &ToolContext{CWD: dir})

	if result.IsError {
		t.Fatalf("unexpected error: %s", result.Content)
	}

	data, _ := os.ReadFile(path)
	if string(data) != "qux\nbar\nqux\nbaz\n" {
		t.Errorf("unexpected content: %s", string(data))
	}
}

func TestFileEdit_NotFound(t *testing.T) {
	dir := t.TempDir()
	path := writeTestFile(t, dir, "test.txt", "hello world")

	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"file_path":  path,
		"old_string": "nonexistent",
		"new_string": "replacement",
	}, &ToolContext{CWD: dir})

	if !result.IsError {
		t.Error("expected error when old_string not found")
	}
}

func TestFileEdit_IdenticalStrings(t *testing.T) {
	dir := t.TempDir()
	path := writeTestFile(t, dir, "test.txt", "hello")

	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"file_path":  path,
		"old_string": "hello",
		"new_string": "hello",
	}, &ToolContext{CWD: dir})

	if !result.IsError {
		t.Error("expected error when old_string equals new_string")
	}
}

func TestFileEdit_MissingFilePath(t *testing.T) {
	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"old_string": "a",
		"new_string": "b",
	}, &ToolContext{CWD: "."})

	if !result.IsError {
		t.Error("expected error for missing file_path")
	}
}

func TestFileEdit_MissingOldString(t *testing.T) {
	dir := t.TempDir()
	path := writeTestFile(t, dir, "test.txt", "hello")

	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"file_path":  path,
		"new_string": "world",
	}, &ToolContext{CWD: dir})

	if !result.IsError {
		t.Error("expected error for missing old_string")
	}
}

func TestFileEdit_NonexistentFile(t *testing.T) {
	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"file_path":  "/nonexistent/path/file.txt",
		"old_string": "a",
		"new_string": "b",
	}, &ToolContext{CWD: "."})

	if !result.IsError {
		t.Error("expected error for nonexistent file")
	}
}

func TestFileEdit_PreservesIndentation(t *testing.T) {
	dir := t.TempDir()
	content := "func main() {\n\tif true {\n\t\tfmt.Println(\"old\")\n\t}\n}\n"
	path := writeTestFile(t, dir, "test.go", content)

	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"file_path":  path,
		"old_string": "\t\tfmt.Println(\"old\")",
		"new_string": "\t\tfmt.Println(\"new\")",
	}, &ToolContext{CWD: dir})

	if result.IsError {
		t.Fatalf("unexpected error: %s", result.Content)
	}

	data, _ := os.ReadFile(path)
	expected := "func main() {\n\tif true {\n\t\tfmt.Println(\"new\")\n\t}\n}\n"
	if string(data) != expected {
		t.Errorf("indentation not preserved:\ngot:  %q\nwant: %q", string(data), expected)
	}
}

func TestFileEdit_EmptyFileContent(t *testing.T) {
	dir := t.TempDir()
	path := writeTestFile(t, dir, "empty.txt", "")

	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"file_path":  path,
		"old_string": "anything",
		"new_string": "replacement",
	}, &ToolContext{CWD: dir})

	if !result.IsError {
		t.Error("expected error when searching in empty file")
	}
}

func TestFileEdit_MultilineReplace(t *testing.T) {
	dir := t.TempDir()
	content := "line1\nline2\nline3\n"
	path := writeTestFile(t, dir, "test.txt", content)

	tool := NewFileEditTool()
	result := tool.Execute(map[string]any{
		"file_path":  path,
		"old_string": "line1\nline2",
		"new_string": "replaced1\nreplaced2",
	}, &ToolContext{CWD: dir})

	if result.IsError {
		t.Fatalf("unexpected error: %s", result.Content)
	}

	data, _ := os.ReadFile(path)
	if string(data) != "replaced1\nreplaced2\nline3\n" {
		t.Errorf("unexpected content: %q", string(data))
	}
}
