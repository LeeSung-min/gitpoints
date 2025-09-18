import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [activeTab, setActiveTab] = useState('repositories');
  const [stats, setStats] = useState(null);

  // Load token from environment variable on mount
  useEffect(() => {
    const envToken = process.env.REACT_APP_GITHUB_TOKEN;
    if (envToken) {
      setToken(envToken);
    }
  }, []);

  const makeGitHubRequest = async (url) => {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Gitpoints-App'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      } else if (response.status === 403) {
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');
        const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null;
        throw new Error(`Rate limit exceeded. ${resetTime ? `Resets at ${resetTime.toLocaleTimeString()}` : 'Try adding a personal access token.'}`);
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return response.json();
  };

  const calculateQualityScore = (repo) => {
    let score = 0;
    let maxScore = 100;

    // Security indicators (25 points)
    if (repo.has_issues) score += 5; // Issues tracking enabled
    if (repo.description && repo.description.toLowerCase().includes('security')) score += 5;
    if (repo.homepage) score += 5; // Has documentation/homepage
    if (repo.license) score += 10; // Has license

    // Reliability indicators (35 points)
    const now = new Date();
    const lastUpdate = new Date(repo.updated_at);
    const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 30) score += 15; // Recently updated
    else if (daysSinceUpdate < 90) score += 10;
    else if (daysSinceUpdate < 365) score += 5;

    if (repo.stargazers_count > 0) score += 5; // Has community interest
    if (repo.forks_count > 0) score += 5; // Has been forked
    if (repo.open_issues_count >= 0) {
      // Lower open issues ratio is better
      const totalActivity = repo.stargazers_count + repo.forks_count + 1;
      const issueRatio = repo.open_issues_count / totalActivity;
      if (issueRatio < 0.1) score += 10;
      else if (issueRatio < 0.3) score += 5;
    }

    // Maintainability indicators (40 points)
    if (repo.description && repo.description.length > 20) score += 10; // Good description
    if (repo.language) score += 10; // Has primary language
    if (repo.topics && repo.topics.length > 0) score += 10; // Has topics/tags
    if (!repo.archived) score += 10; // Not archived

    return Math.round((score / maxScore) * 100);
  };

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Get user info
      const userInfo = await makeGitHubRequest(`https://api.github.com/users/${username.trim()}`);
      setCurrentUser(userInfo);

      // Get user's repositories
      const reposData = await makeGitHubRequest(`https://api.github.com/users/${username.trim()}/repos?per_page=100&sort=updated`);
      
      // Calculate quality scores and add additional metrics
      const reposWithScores = reposData.map(repo => ({
        ...repo,
        quality_score: calculateQualityScore(repo)
      }));

      // Sort by quality score
      reposWithScores.sort((a, b) => b.quality_score - a.quality_score);
      
      setRepos(reposWithScores);

      // Calculate overall stats
      const totalStars = reposWithScores.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = reposWithScores.reduce((sum, repo) => sum + repo.forks_count, 0);
      const avgQualityScore = reposWithScores.length > 0 
        ? Math.round(reposWithScores.reduce((sum, repo) => sum + repo.quality_score, 0) / reposWithScores.length)
        : 0;
      
      const languages = {};
      reposWithScores.forEach(repo => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });

      setStats({
        totalRepos: reposWithScores.length,
        totalStars,
        totalForks,
        avgQualityScore,
        languages
      });

      // Add user to comparison list if not already there
      setUsers(prev => {
        const exists = prev.find(u => u.login === userInfo.login);
        if (!exists) {
          return [...prev, { ...userInfo, stats: { totalRepos: reposWithScores.length, totalStars, totalForks, avgQualityScore } }];
        }
        return prev.map(u => u.login === userInfo.login 
          ? { ...u, stats: { totalRepos: reposWithScores.length, totalStars, totalForks, avgQualityScore } }
          : u
        );
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeUser = (login) => {
    setUsers(prev => prev.filter(u => u.login !== login));
    if (currentUser?.login === login) {
      setCurrentUser(null);
      setRepos([]);
      setStats(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getQualityColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#ca8a04';
    if (score >= 40) return '#ea580c';
    return '#dc2626';
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">GP</div>
            Gitpoints
          </div>
        </div>
      </header>

      <main className="main-container">
        <div className="hero-section">
          <h1 className="hero-title">Analyze GitHub Quality</h1>
          <p className="hero-subtitle">
            Discover code quality metrics, compare developers, and explore repository insights with our advanced GitHub analytics.
          </p>
        </div>

        <div className="search-section">
          <form className="search-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <div className="input-group">
              <label className="input-label" htmlFor="username">GitHub Username</label>
              <input
                id="username"
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g., torvalds)"
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !username.trim()}
            >
              {loading ? <span className="loading-spinner"></span> : null}
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>

          <div className="token-section">
            <button 
              className="token-toggle"
              onClick={() => setShowTokenInput(!showTokenInput)}
            >
              {showTokenInput ? 'Hide' : 'Add'} Personal Access Token (Higher rate limits)
            </button>
            {showTokenInput && (
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label className="input-label" htmlFor="token">Personal Access Token (Optional)</label>
                <input
                  id="token"
                  type="password"
                  className="input-field"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {users.length > 0 && (
          <div className="results-section">
            <h2 className="section-title">User Comparison</h2>
            <div className="stats-grid">
              {users.map(user => (
                <div key={user.login} className="stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={user.avatar_url} 
                        alt={user.login}
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>{user.login}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{user.name || 'No name'}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeUser(user.login)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="stat-value" style={{ color: getQualityColor(user.stats.avgQualityScore) }}>
                    {user.stats.avgQualityScore}%
                  </div>
                  <div className="stat-label">Quality Score</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                    {user.stats.totalRepos} repos • {user.stats.totalStars} stars
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentUser && (
          <div className="results-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <img 
                src={currentUser.avatar_url} 
                alt={currentUser.login}
                style={{ width: '48px', height: '48px', borderRadius: '50%' }}
              />
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {currentUser.name || currentUser.login}
                </h2>
                <p style={{ margin: 0, color: '#64748b' }}>
                  @{currentUser.login} • {currentUser.public_repos} public repos
                </p>
              </div>
            </div>

            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalRepos}</div>
                  <div className="stat-label">Repositories</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalStars}</div>
                  <div className="stat-label">Total Stars</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalForks}</div>
                  <div className="stat-label">Total Forks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" style={{ color: getQualityColor(stats.avgQualityScore) }}>
                    {stats.avgQualityScore}%
                  </div>
                  <div className="stat-label">Quality Score</div>
                </div>
              </div>
            )}

            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'repositories' ? 'active' : ''}`}
                onClick={() => setActiveTab('repositories')}
              >
                Repositories ({repos.length})
              </button>
              <button 
                className={`tab ${activeTab === 'languages' ? 'active' : ''}`}
                onClick={() => setActiveTab('languages')}
              >
                Languages
              </button>
            </div>

            {activeTab === 'repositories' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {repos.map(repo => (
                  <div key={repo.id} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    background: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <a 
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              fontSize: '1.25rem', 
                              fontWeight: '600', 
                              color: '#1e293b',
                              textDecoration: 'none'
                            }}
                          >
                            {repo.name}
                          </a>
                          {repo.private && (
                            <span style={{ 
                              background: '#fbbf24', 
                              color: 'white', 
                              padding: '0.125rem 0.5rem', 
                              borderRadius: '9999px', 
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              Private
                            </span>
                          )}
                        </div>
                        <p style={{ 
                          color: '#64748b', 
                          margin: '0 0 1rem 0',
                          lineHeight: 1.5
                        }}>
                          {repo.description || 'No description available'}
                        </p>
                      </div>
                      <div style={{ 
                        background: getQualityColor(repo.quality_score),
                        color: 'white',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        marginLeft: '1rem'
                      }}>
                        {repo.quality_score}%
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1.5rem',
                      fontSize: '0.875rem',
                      color: '#64748b',
                      flexWrap: 'wrap'
                    }}>
                      {repo.language && (
                        <span>📝 {repo.language}</span>
                      )}
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🍴 {repo.forks_count}</span>
                      <span>📅 Updated {formatDate(repo.updated_at)}</span>
                      {repo.license && (
                        <span>📄 {repo.license.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'languages' && stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {Object.entries(stats.languages)
                  .sort(([,a], [,b]) => b - a)
                  .map(([language, count]) => (
                    <div key={language} className="stat-card">
                      <div className="stat-value">{count}</div>
                      <div className="stat-label">{language}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;