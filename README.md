# branch-pad

branch-pad is an interactive Python notebook environment that allows you to create and explore multiple branches of code execution. Unlike traditional notebooks that follow a linear execution flow, branch-pad enables you to fork your code at any point, creating independent branches that maintain their own execution context.

**Currently in beta** and this is just an MVP.

<img width="944" alt="image" src="https://github.com/user-attachments/assets/3dab3707-f85a-4dc6-a3c8-415b0667dbfc" />

It's also reactive--any changes to the parent causes all siblings to re-execute. Notebooks can be exported and are just Python scripts and a requirements.txt file.

To install a package, just use it, e.g., "import numpy". You can find the installed version as well:

<img width="453" alt="image" src="https://github.com/user-attachments/assets/a76c17e2-0b9f-4817-b10c-7f86a76a37c4" />
<img width="526" alt="image" src="https://github.com/user-attachments/assets/ab9230e8-e0c0-4de8-9404-3a6c7333450e" />


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

## Similar projects, but do not allow forking cells into different execution environments

- **ipyflow**  
  A reactive Python kernel for Jupyter that tracks cell dependencies and automatically re‐executes affected cells so that each cell’s output is always consistent with a “restart and run all” state. This focus on dataflow reactivity is similar in spirit to branch‐pad’s idea of exploring alternate execution paths.  
  citeturn0search9

- **Marimo**  
  A relatively new take on Python notebooks, Marimo stores notebooks as regular Python files and introduces reactivity to allow changes to propagate through related code segments. Its approach to reactivity and preserving execution context resonates with branch‐pad’s branching model.

- **Pluto.jl**  
  A reactive notebook environment for the Julia language. Pluto.jl automatically tracks dependencies between cells and re‐executes them as needed—offering a live, dynamic experience that shares many conceptual similarities with branch‐pad’s reactive, non-linear execution model.

- **Observable**  
  Though built for JavaScript, Observable notebooks are fully reactive. Cells update automatically when their inputs change, enabling a dynamic, interactive experience. Its reactivity model has inspired similar ideas in other notebook ecosystems.

- **Deepnote**  
  A collaborative, cloud-based notebook platform that features real-time collaboration, interactive execution, and advanced sharing options. While it doesn’t explicitly “branch” code execution, its emphasis on an interactive, live coding environment makes it comparable.

- **Nextjournal**  
  An online notebook platform for reproducible data science that supports complex execution flows (including branching experiments) and emphasizes versioning and reproducibility.

- **Datalore**  
  JetBrains’ collaborative notebook environment which combines intelligent code assistance with interactive data visualization and reproducibility. Its design supports exploratory coding much like branch‐pad’s experimental and branchable approach.
