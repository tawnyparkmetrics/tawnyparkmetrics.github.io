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
        permanent: true,
      },
      {
        source: '/Andre_Draft_Page',
        destination: '/andre-nba-draft-board',
        permanent: true,
      },
      {
        source: '/TPM_Draft_Page',
        destination: '/max-nba-draft-board',
        permanent: true,
      },
      {
        source: '/TPM_Write_Up',
        destination: '/max-nba-draft-model-write-up',
        permanent: true,
      },
      {
        source: '/Consensus',
        destination: '/consensus-nba-draft-board',
        permanent: true,
      },
      {
        source: '/TPM_FVC',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
