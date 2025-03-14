# branch-pad

branch-pad is an interactive Python notebook environment that enables branching experimentation and hypothesis testing. It allows researchers and developers to explore multiple approaches simultaneously while maintaining a clear history of their work.

<img width="1151" alt="image" src="https://github.com/user-attachments/assets/dbe26f80-969a-4fe4-b21c-8a6f1ef81d33" />

<img width="849" alt="image" src="https://github.com/user-attachments/assets/22dc6596-a06b-4b7d-bf74-29a498645af3" />

<img width="530" alt="image" src="https://github.com/user-attachments/assets/f6df5324-7ef9-4d3d-b34d-19677dccc978" />

## Features

### 1. Branch Management

#### Creating Branches

- Click the "Branch" button on any cell to create two parallel branches
- Each branch inherits the parent's code and execution context
- Branches are visually connected to show relationships
- Each branch gets a unique color for easy identification

#### Branch Customization

- **Labels**: Give each branch a meaningful name
- **Descriptions**: Add detailed notes about the branch's purpose
- **Colors**: Choose from multiple color themes for visual organization
- **Collapsible View**: Toggle branch visibility using the arrow button

<img width="407" alt="image" src="https://github.com/user-attachments/assets/aeb99874-0204-4253-903d-14b583661fcb" />

### 2. Code Execution

#### Independent Environments

- Each branch maintains its own Python execution context
- Changes in one branch don't affect others
- Automatic package detection and installation
- Real-time output display

#### Package Management

- Click "Show Packages" to view installed packages
- Search functionality to find specific packages
- Automatic version tracking
- Package state is preserved per branch

### 3. Snapshotting & Versioning

#### Creating Snapshots

1. Click the "Create Snapshot" button on any branch
2. Enter a label for the snapshot
3. The snapshot captures:
   - Code state
   - Output
   - Execution context
   - Environment state
   - Timestamp

#### Managing Snapshots

- View all snapshots in chronological order
- Each snapshot shows:
  - Label
  - Creation timestamp
  - Code preview
- "Restore" button to revert to any snapshot
- "Return to Current" to exit snapshot view

### 4. Branch Comparison

#### Comparing Branches

1. Click "Compare Branches" to enter comparison mode
2. Select up to two branches to compare
3. View differences in:
   - Code (with highlighted changes)
   - Output
   - Variables
   - Execution context

#### Comparison Features

- Side-by-side diff view
- Added/removed code highlighting
- Output comparison
- Variable state comparison

### 5. Export & Deployment

#### Notebook Export

- Click "Export Notebook" to save the entire workspace
- Preserves all branches and their relationships
- Includes execution history and outputs

#### Deployment Export

1. Click "Export for Deployment" button
2. Select the target branch
3. Generates a ZIP file containing:
   - `script.py`: Combined Python script from root to selected branch
   - `requirements.txt`: All required packages with versions
   - `Dockerfile`: Ready-to-use container configuration
   - `README.md`: Setup and running instructions

#### Deployment Options

- **Local Execution**:

  ```bash
  pip install -r requirements.txt
  python script.py
  ```

- **Docker Deployment**:
  ```bash
  docker build -t branch-pad-[branch-id] .
  docker run branch-pad-[branch-id]
  ```

### 6. UI Features

#### Tree View

- Visual representation of branch hierarchy
- Collapsible branches to manage complexity
- Branch count indicators
- Parent-child relationship lines

#### Dark Mode Support

- Automatic dark mode detection
- Theme-aware UI components
- High contrast accessibility

## Getting Started

1. **Initial Setup**

   - The root branch is created automatically
   - Enter your Python code in the code editor
   - Click "Run" to execute the code

2. **Creating Experiments**

   - Branch from any existing cell
   - Label your branches meaningfully
   - Add descriptions for context
   - Use different colors for organization

3. **Managing Versions**
   - Create snapshots at important points
   - Use the comparison tool to track changes
   - Export branches for deployment when ready

## Best Practices

1. **Branch Organization**

   - Use meaningful branch labels
   - Add detailed descriptions
   - Choose distinct colors for different experiments
   - Collapse unused branches to reduce clutter

2. **Version Control**

   - Create snapshots before major changes
   - Use descriptive snapshot labels
   - Compare branches to understand differences
   - Export important versions for backup

3. **Deployment**
   - Test exported scripts locally first
   - Verify all dependencies are captured
   - Use Docker for consistent environments
   - Document any special requirements

## Technical Details

- Built with Next.js and React
- Uses Pyodide for in-browser Python execution
- Supports Python 3.9+ features
- Real-time code execution and output
- Automatic package management
- Dark mode support

## Deployment

### GitHub Pages

This project is configured for easy deployment to GitHub Pages. Here's how to deploy:

1. **Push to GitHub**: Push your code to a GitHub repository.

2. **Enable GitHub Pages**:

   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Build and deployment", select "GitHub Actions" as the source

3. **Automatic Deployment**:

   - The included GitHub Actions workflow will automatically build and deploy your site when you push to the main branch
   - Your site will be available at `https://[your-username].github.io/[repository-name]/`

4. **Local Testing**:
   - Run `./run.ps1` to build the project with the correct base path
   - Use a static file server to test the output: `npx serve out`

### Configuration Details

The deployment setup includes:

- Static export configuration in `next.config.ts`
- Automatic base path detection for GitHub Pages
- GitHub Actions workflow for CI/CD

If you need to customize the deployment, you can modify:

- `.github/workflows/deploy.yml` for CI/CD settings
- `next.config.ts` for Next.js export options
