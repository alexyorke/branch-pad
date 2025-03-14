# BranchPad

BranchPad is an interactive Python notebook environment that allows you to create and explore multiple branches of code execution. Unlike traditional notebooks that follow a linear execution flow, BranchPad enables you to fork your code at any point, creating independent branches that maintain their own execution context.

**Currently in beta** and this is just an MVP.

<img width="1327" alt="image" src="https://github.com/user-attachments/assets/06fff971-3655-4c57-bffe-04753a81c288" />

It's also reactive--any changes to the parent causes all siblings to re-execute.

## Features

- **Interactive Python Environment**: Run Python code directly in your browser using Pyodide
- **Branch-Based Execution**: Fork any code cell to create multiple execution paths
- **Context Preservation**: Each branch maintains its own independent execution context
- **Real-Time Output**: See the output of your code execution immediately
- **Visual Tree Structure**: Intuitive visualization of code branches and their relationships
- **Persistent State**: Each branch remembers its execution state and variables

## How It Works

1. **Root Cell**: Start with a root cell where you can write and execute Python code
2. **Branching**: Use the "Branch" button to create two new independent copies of any cell
3. **Independent Execution**: Each branch maintains its own Python environment and variables
4. **Visual Hierarchy**: Branches are displayed in a tree structure, showing their relationships
5. **Context Inheritance**: New branches inherit the execution context of their parent cell

## Technical Details

- Built with Next.js and React
- Uses Pyodide for in-browser Python execution
- Implements a tree-based data structure for managing code branches
- Features real-time code execution and output display

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Use Cases

- **Algorithm Exploration**: Test different approaches to solving a problem
- **Data Analysis**: Explore different data processing paths
- **Educational Tools**: Demonstrate how different code changes affect outcomes
- **Code Experimentation**: Safely test code modifications without losing original context

## Requirements

- Modern web browser with JavaScript enabled
- Internet connection (for loading Pyodide)
