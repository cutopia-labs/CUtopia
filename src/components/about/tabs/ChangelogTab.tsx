import { useEffect, useState } from 'react';

import './Tab.scss';
import Card from '../../atoms/Card';
import ChangelogItem from '../ChangelogItem';
import useMobileQuery from '../../../hooks/useMobileQuery';
import Loading from '../../atoms/Loading';

const ChangelogTab = () => {
  const [commits, setCommits] = useState(null);
  const isMobile = useMobileQuery();

  useEffect(() => {
    const fetchCommits = async () => {
      // API reference: https://docs.github.com/en/rest/reference/repos#commits
      // TODO: to be replaced when the repos are public
      // TODO: fetch and cache in server side due to:
      // https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting

      const repoACommits = await (
        await fetch(
          'https://api.github.com/repos/facebook/react/commits?per_page=10'
        )
      ).json();
      setCommits(repoACommits);
    };

    fetchCommits();
  }, []);

  return (
    <Card className="about-card">
      {commits ? (
        commits.map((commit) => (
          <ChangelogItem
            key={commit.html_url}
            committer={commit.commit.author.name}
            message={commit.commit.message}
            url={commit.html_url}
            date={commit.commit.author.date}
            avatar_url={commit.author.avatar_url}
          />
        ))
      ) : (
        <Loading />
      )}
    </Card>
  );
};

export default ChangelogTab;
