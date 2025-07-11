import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    const redirects = {
      '/Nick_Draft_Page': '/nick-nba-draft-board',
      '/Andre_Draft_Page': '/andre-nba-draft-board',
      '/TPM_Draft_Page': '/max-nba-draft-board',
      '/TPM_Write_Up': '/max-nba-draft-model-write-up',
      '/Consensus': '/consensus-nba-board',
    };

    if (redirects[router.asPath]) {
      router.replace(redirects[router.asPath]);
    }
  }, [router]);

  return <div>Redirecting...</div>;
}