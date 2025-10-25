import styled from '@emotion/styled';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Divider } from '@mui/material';

// value: 'grid' | 'list'
// onChange(next)
const ExpandToggle = ({ expand }) => {
  return (
    <Wrapper role="group" aria-label="Erweiterung umschalten">
      <Button onClick={() => expand(false)} title="Alle ausklappen">
        <ExpandMoreIcon fontSize="small" />
      </Button>
      <Divider orientation="vertical" flexItem />
      <Button onClick={() => expand(true)} title="Alle einklappen">
        <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} fontSize="small" />
      </Button>
    </Wrapper>
  );
};

export default ExpandToggle;

const Wrapper = styled.div`
  display: inline-flex;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  color: inherit;
  background: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;
