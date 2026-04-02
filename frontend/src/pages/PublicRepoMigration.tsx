import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link2, Loader2, XCircle } from 'lucide-react';
import { getRepoForMigration, fetchMultipleFiles, isValidGithubUrl } from '../services/githubPublicRepo.service';

const PublicRepoMigration = () => {
  const [searchParams] = useSearchParams();
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setGithubUrl(urlParam);
      setTimeout(() => handleFetchRepo(urlParam), 500);
    }
  }, [searchParams]);

  const handleFetchRepo = async (urlToFetch?: string | React.MouseEvent) => {
    const url = typeof urlToFetch === 'string' ? urlToFetch : githubUrl;
    if (!url.trim()) { setError('Please enter a GitHub URL'); return; }
    if (!isValidGithubUrl(url)) { setError('Invalid GitHub URL. Please use format: https://github.com/owner/repo'); return; }

    setLoading(true);
    setError('');

    const result = await getRepoForMigration(url);

    if (!result.success) {
      setError(result.error || 'Failed to fetch repository');
      setLoading(false);
      return;
    }

    // Fetch all file contents
    const filesResult = await fetchMultipleFiles(
      result.owner,
      result.repo,
      result.branch,
      result.files.map((f: any) => f.path)
    );

    setLoading(false);

    if (!filesResult.success) {
      setError('Failed to fetch file contents');
      return;
    }

    // Navigate to the same RepoFiles page used by folder/file upload
    navigate('/repos-files', {
      state: {
        files: filesResult.files.map((f: any) => ({
          ...f,
          name: f.path.split('/').pop(),
        })),
        repoName: result.repo,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Migrate from Public GitHub Repository</h1>
          <p className="text-gray-400">Enter a public GitHub repository URL to analyze and migrate your code</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <label className="block text-sm font-medium mb-2">GitHub Repository URL</label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Link2 className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchRepo()}
                placeholder="https://github.com/owner/repo"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleFetchRepo}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (<><Loader2 className="animate-spin" size={20} />Fetching...</>) : 'Fetch Repository'}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-2">
              <XCircle size={20} className="text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicRepoMigration;
