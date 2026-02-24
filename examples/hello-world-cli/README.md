# Hello World CLI Examples

This directory contains simple Command Line Interface (CLI) applications generated in multiple languages. They serve as minimal examples of using `prose-lang` to build standalone binaries that print formatted text.

**Compiled From:** `hello.prose` and `namaste.prose`  
**Generated Stacks:** Java, Go  

## Included Applications

1. **`hello.prose` (Java)**  
   A minimal Java application that simply prints "Hello World!". 
   
2. **`namaste.prose` (Go)**  
   A Go CLI tool that can repeatedly print "Namaste World" along with the current automated timestamp.

## Getting Started

You can compile and run either of these generated applications locally depending on your installed toolchain.

### Running the Go App (`namaste.prose`)
```bash
cd generated/namaste
go run main.go
```
*Output: `Namaste World, 2026-02-23T22:53:24Z`*

### Running the Java App (`hello.prose`)
You will need a Java runtime and compiler (`javac` & `java`).
```bash
cd generated/hello/src/main/java
javac Hello.java
java Hello
```
*Output: `Hello World!`*
