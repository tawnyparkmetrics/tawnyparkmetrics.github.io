// Removed TypeScript-only syntax for JavaScript compatibility

const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/Nick_Draft_Page',
        destination: '/nick-nba-draft-board',
        permanent: true, // Use 301 redirect for SEO
      },
      {
        source: '/Andre_Draft_Page',
        destination: '/andre-nba-draft-board',
        permanent: true, // Use 301 redirect for SEO
      },
      {
        source: '/TPM_Draft_Page',
        destination: '/max-nba-draft-board',
        permanent: true, // Use 301 redirect for SEO
      },
      {
        source: '/TPM_Write_Up',
        destination: '/max-nba-draft-model-write-up',
        permanent: true, // Use 301 redirect for SEO
      },
      {
        source: '/Consensus',
        destination: '/consensus-nba-board',
        permanent: true, // Use 301 redirect for SEO
      },
    ];
  },
};

export default nextConfig;
