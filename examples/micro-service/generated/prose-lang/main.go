package main

import "fmt"
import "log"

import "github.com/anomalyco/opencode"

func main() {
	// Initialize Prose Compiler
	compiler := opencode.NewCompiler()

	// Sync and generate code
	err := compiler.Generate("./.prose/specification.md")
	if err != nil {
		log.Fatalf("Error generating code: %v", err)
	}

	// Build artifacts
	if err := compiler.Build(); err != nil {
		log.Fatalf("Build failed: %v", err)
	}

	fmt.Println("Prose application generated and built successfully!")
}
