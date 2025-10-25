import styled from '@emotion/styled';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Container>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </Container>
  );
}

export default App;

const Container = styled.div`
  width: 100%;
  padding: 20px;
  /* display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; */
`;
