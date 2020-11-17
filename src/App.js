import _ from 'lodash';
import React, { Suspense } from 'react';
import useSWR, { SWRConfig } from 'swr';

import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

class ErrorBoundary extends React.Component {
  state = {
    error: null
  }

  static getDerivedStateFromError(error) {    // Update state so the next render will show the fallback UI.    
    return { error };  
  }
  
  //componentDidCatch(error, errorInfo) {}
  render() {
    if (this.state.error) {
      return this.props.fallback;
    }
    return this.props.children; 
  }
}

function urlToSwrKey(url) {
  return url.replace("https://swapi.dev/api/", "")
}

function SuspenseBoundary(props) {
  return (<ErrorBoundary fallback={<Alert severity="error">Error fetching data</Alert>}>
    <Suspense fallback={<CircularProgress />}>
      {props.children}
    </Suspense>
  </ErrorBoundary>)
}

function CharacterName({ url }) {
  const { data } = useSWR(urlToSwrKey(url));
  return data.name;
}

function CharactersCell({ characters }) {
  return (
    <SuspenseBoundary>
      {characters.map((url, idx) => <span>{idx ? ', ' : ''}<CharacterName url={url} /></span>)}
    </SuspenseBoundary>
  );
}

function Films() {
  const { data: films } = useSWR("films")
  return <section>
    <h2>Films {films.results.length}</h2>
    <p>Count: {films.results.length}</p>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nr.</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Episode</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Characters</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {films.results.map((f, idx) => 
          <TableRow key={f.episode_id}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{f.title}</TableCell>
            <TableCell>{f.episode_id}</TableCell>
            <TableCell>{f.release_date}</TableCell>
            <TableCell>{f.characters.length} {/* <CharactersCell ..f />*/}</TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </TableContainer>
  </section>
}

export default () => (
  <SWRConfig value={{ 
    suspense: true,
    fetcher: (resource, init) => fetch(`https://swapi.dev/api/${resource}`, init).then(res => res.json()) 
    }}>
    <Container>
      <h1>Star Wars</h1>
      <ErrorBoundary fallback={<h2>Could not fetch films.</h2>}>
        <Suspense fallback={<h3>Loading...</h3>}>
          <Films />
        </Suspense>
      </ErrorBoundary>
    </Container>
  </SWRConfig>
);
