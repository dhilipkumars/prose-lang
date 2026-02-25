package main

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
)

func TestMainOutput(t *testing.T) {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	main()

	w.Close()
	os.Stdout = old

	var buf bytes.Buffer
	io.Copy(&buf, r)
	output := buf.String()

	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) != 5 {
		t.Errorf("expected 5 lines of output, got %d", len(lines))
	}

	for _, line := range lines {
		if !strings.HasPrefix(line, "Namaste World!,") {
			t.Errorf("line does not start with expected prefix: %s", line)
		}
	}
}
