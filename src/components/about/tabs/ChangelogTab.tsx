import { useEffect, useState } from 'react';
import { Divider, Grid } from '@material-ui/core';

import './Tab.scss';
import Card from '../../atoms/Card';
import ChangelogItem from '../ChangelogItem';
import useMobileQuery from '../../../helpers/useMobileQuery';

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
          'https://api.github.com/repos/facebook/react/commits?per_page=5'
        )
      ).json();
      const repoBCommits = await (
        await fetch(
          'https://api.github.com/repos/apollographql/apollo-server/commits?per_page=5'
        )
      ).json();
      setCommits([repoACommits, repoBCommits]);
    };

    fetchCommits();
  }, []);

  return (
    <Card className="tab-card">
      <Grid container alignItems="center" justifyContent="space-evenly">
        <Grid item>
          <p className="header center-text">Frontend</p>
          {commits &&
            commits[0].map((commit) => (
              <ChangelogItem
                committer={commit.commit.author.name}
                message={commit.commit.message}
                url={commit.html_url}
                date={commit.commit.author.date}
                avatar_url={commit.author.avatar_url}
              />
            ))}
        </Grid>
        {!isMobile && <Divider orientation="vertical" flexItem />}
        <Grid item>
          <p className="header center-text">Backend</p>
          {commits &&
            commits[1].map((commit) => (
              <ChangelogItem
                committer={commit.commit.author.name}
                message={commit.commit.message}
                url={commit.html_url}
                date={commit.commit.author.date}
                avatar_url={commit.author.avatar_url}
              />
            ))}
        </Grid>
      </Grid>
    </Card>
  );
};

export default ChangelogTab;
