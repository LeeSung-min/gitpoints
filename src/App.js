import React, { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [stats, setStats] = useState(null);

  const handleSearch = () => {
    fetch(`https://api.github.com/users/${username}/repos`)
      .then(res => res.json())
      .then(data => {
        setRepos(data);
        let totalStars = 0, totalForks = 0, languages = {};
        data.forEach(repo => {
          totalStars += repo.stargazers_count;
          totalForks += repo.forks_count;
          if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
          }
        });
        setStats({ totalStars, totalForks, languages });
      });
  };

  return (
    <div>
      <h1>Gitpoints</h1>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Enter GitHub username"
      />
      <button onClick={handleSearch}>Analyze</button>
      <ul>
        {repos.map(repo => <li key={repo.id}>{repo.name}</li>)}
      </ul>
      {stats && (
        <div>
          <p>Total repos: {repos.length}</p>
          <p>Total stars: {stats.totalStars}</p>
          <p>Total forks: {stats.totalForks}</p>
          <ul>
            {Object.entries(stats.languages).map(([lang, count]) => (
              <li key={lang}>{lang}: {count}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;