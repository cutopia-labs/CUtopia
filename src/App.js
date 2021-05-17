import React from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import ForumPage from './containers/forum';
import logo from './logo.svg';

import './App.css';

const App = () => {
  const preference = useContext(PreferenceContext);
  const user = useContext(UserContext);
  const client = useMemo(() => {
    const httpLink = createHttpLink({
      uri: 'https://7n5g73jlp6.execute-api.ap-northeast-1.amazonaws.com/Stage/graphql',
    });
    const authLink = setContext((_, { headers }) => {
      const token = user.token;
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });
    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    });
  }, [user.token]);

  if (user.loginState !== undefined) {
    console.log(user.loginState === LOGIN_STATES.LOGGED_IN_CUTOPIA ? 'Logged in' : 'Not Logged in');
  }
  
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <HomePage
              {...props}
            />
          </Route>
          <Route exact path="/article/:id">
            <ArticlePage {...props} />
          </Route>
          <Route exact path="/edit">
            <EditPage {...props} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
