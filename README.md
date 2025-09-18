# Gitpoints - GitHub Repository Analytics

> A modern, polished web application for analyzing GitHub repositories and developers with advanced code quality metrics.

![Gitpoints Homepage](https://github.com/user-attachments/assets/9c3110ad-a00d-456f-9359-7fb8ac9628bc)

## 🚀 Features

### 🔍 Repository Quality Analysis
- **Advanced Quality Scoring**: Proprietary algorithm analyzing security, reliability, and maintainability
- **Color-coded Quality Indicators**: Visual quality scores from 0-100%
- **Comprehensive Repository Information**: Stars, forks, language, last updated, license, and more
- **Direct GitHub Links**: Click-through to view repositories on GitHub

### 👥 Developer Comparison
- **Multi-user Analysis**: Compare multiple GitHub users side-by-side
- **Aggregated Metrics**: Overall quality scores across all repositories
- **User Statistics**: Repository count, total stars, forks, and quality ratings
- **Visual Profiles**: User avatars and profile information integration

### 📊 Quality Metrics Algorithm

Our proprietary scoring system evaluates repositories across three key dimensions:

#### Security (25 points)
- ✅ **License Presence** (10 pts): Repository has an open source license
- ✅ **Documentation** (5 pts): Has homepage or detailed description
- ✅ **Issue Tracking** (5 pts): Issues feature enabled for community feedback
- ✅ **Security Keywords** (5 pts): Description mentions security-related terms

#### Reliability (35 points)
- ✅ **Recent Activity** (15 pts): Updated within last 30/90/365 days
- ✅ **Community Interest** (5 pts): Has stars indicating community adoption
- ✅ **Collaboration** (5 pts): Has been forked by other developers
- ✅ **Issue Management** (10 pts): Low ratio of open issues to total activity

#### Maintainability (40 points)
- ✅ **Quality Description** (10 pts): Comprehensive description (>20 characters)
- ✅ **Language Classification** (10 pts): Has identified primary programming language
- ✅ **Topic Tags** (10 pts): Uses GitHub topics for categorization
- ✅ **Active Maintenance** (10 pts): Repository is not archived

## 🛠️ Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LeeSung-min/gitpoints.git
   cd gitpoints
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🔐 GitHub API Authentication (Optional)

For higher rate limits, you can provide a GitHub Personal Access Token:

#### Method 1: Environment Variable
Create a `.env` file in the root directory:
```env
REACT_APP_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

#### Method 2: UI Input
Click "Add Personal Access Token" in the application interface and enter your token.

#### Creating a Personal Access Token
1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
2. Generate a new token with **public repository read access**
3. No special scopes are required - the app only uses public APIs

## 📱 Usage

### Analyzing a Single User
1. Enter a GitHub username in the search field
2. Click "Analyze" to fetch repository data
3. View quality metrics, repository rankings, and statistics
4. Switch between "Repositories" and "Languages" tabs for different views

### Comparing Multiple Users
1. Analyze your first user as described above
2. Enter a second username and analyze
3. The "User Comparison" section will appear showing side-by-side metrics
4. Add more users for comprehensive comparison
5. Remove users by clicking the "×" button on their comparison card

### Understanding Quality Scores

| Score Range | Quality Level | Color Code |
|-------------|---------------|------------|
| 80-100%     | Excellent     | Green      |
| 60-79%      | Good          | Yellow     |
| 40-59%      | Fair          | Orange     |
| 0-39%       | Needs Work    | Red        |

## 🏗️ Technical Architecture

### Built With
- **React 19** - Modern UI framework
- **Create React App** - Development environment and build tools
- **GitHub REST API v3** - Repository and user data
- **Modern CSS** - Figma-inspired design system
- **Responsive Design** - Mobile-first approach

### Key Components
- `App.js` - Main application logic and state management
- `App.css` - Comprehensive styling with modern design patterns
- Quality scoring algorithm with heuristic analysis
- Error handling for rate limits, network issues, and invalid users
- Progressive loading states and user feedback

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Build for production:
```bash
npm run build
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Maintain the existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GitHub API for providing comprehensive repository data
- React community for the excellent development experience
- Figma for design inspiration
- Open source community for valuable feedback and contributions

---

**Built with ❤️ for the developer community**
